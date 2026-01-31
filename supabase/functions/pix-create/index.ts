import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  document?: {
    type: 'cpf' | 'cnpj';
    number: string;
  };
}

interface OrderItem {
  title: string;
  unit_price: number;
  quantity: number;
  tangible: boolean;
  external_ref?: string;
}

interface PixCreateRequest {
  orderId: string;
  amount: number;
  customer: CustomerData;
  items: OrderItem[];
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: PixCreateRequest = await req.json()
    const { orderId, amount, customer, items, metadata } = body

    // Validate required fields
    if (!orderId || !amount) {
      console.error('Missing required fields:', { orderId, amount })
      return new Response(
        JSON.stringify({ success: false, error: 'orderId and amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get API credentials
    const publicKey = Deno.env.get('ANUBISPAY_PUBLIC_KEY')
    const secretKey = Deno.env.get('ANUBISPAY_SECRET_KEY')

    if (!publicKey || !secretKey) {
      console.error('AnubisPay credentials not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if order already has a PIX charge (idempotency)
    const { data: existingCharge } = await supabase
      .from('pix_charges')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle()

    if (existingCharge && existingCharge.status !== 'expired') {
      console.log('Returning existing charge for order:', orderId)
      return new Response(
        JSON.stringify({
          success: true,
          charge: {
            chargeId: existingCharge.charge_id,
            status: existingCharge.status,
            expiresAt: existingCharge.expires_at,
            copyPasteCode: existingCharge.copy_paste_code,
            qrCodeBase64: existingCharge.qr_code_base64,
            qrCodeImageUrl: existingCharge.qr_code_image_url,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build auth header (Basic Auth: base64(PUBLIC_KEY:SECRET_KEY))
    const authString = btoa(`${publicKey}:${secretKey}`)
    
    console.log('Auth header check:', {
      hasPublicKey: !!publicKey,
      hasSecretKey: !!secretKey,
      authPrefix: `Basic ${authString.substring(0, 10)}...`,
    })

    // Webhook URL for receiving payment notifications
    const webhookUrl = `${supabaseUrl}/functions/v1/pix-webhook`

    // Build request body following EXACT AnubisPay schema from docs
    // Required fields: amount, payment_method, postback_url, customer, items, metadata
    const requestBody = {
      amount: Math.round(amount * 100), // Convert to cents
      payment_method: 'pix',
      postback_url: webhookUrl,
      customer: {
        name: customer?.name || 'Cliente',
        email: customer?.email || 'cliente@email.com',
        phone: customer?.phone?.replace(/\D/g, '') || '11999999999',
        document: customer?.document || {
          type: 'cpf',
          number: '00000000000', // Placeholder - should be collected from customer
        },
      },
      items: items && items.length > 0 ? items : [
        {
          title: `Pedido ${orderId}`,
          unit_price: Math.round(amount * 100),
          quantity: 1,
          tangible: true,
          external_ref: orderId,
        }
      ],
      metadata: metadata || {
        orderId: orderId,
        source: 'divino-sabor-app',
      },
    }

    console.log('=== PIX CREATE REQUEST ===')
    console.log('URL: https://api2.anubispay.com.br/v1/payment-transaction/create')
    console.log('Method: POST')
    console.log('Webhook URL:', webhookUrl)
    console.log('Request Body:', JSON.stringify(requestBody, null, 2))

    // Call AnubisPay API
    const response = await fetch('https://api2.anubispay.com.br/v1/payment-transaction/create', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    // Log response details
    console.log('=== PIX CREATE RESPONSE ===')
    console.log('Status Code:', response.status)
    console.log('Status Text:', response.statusText)
    console.log('Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2))

    const responseText = await response.text()
    console.log('Response Body:', responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('Failed to parse AnubisPay response:', responseText)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid response from payment gateway' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!response.ok) {
      console.error('AnubisPay API error:', data)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.message || data.error || `Payment gateway error: ${response.status}`,
          details: data
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract fields from response based on AnubisPay schema
    // Response structure: { data: { id, status, amount, pix: { qr_code, expiration_date, url } }, success, ... }
    const responseData = data.data || data
    const pixData = responseData.pix || {}
    
    const chargeId = responseData.id || responseData.Id || `charge_${Date.now()}`
    const status = responseData.status || responseData.Status || 'PENDING'
    const expiresAt = pixData.expiration_date || pixData.expirationDate || responseData.expiration_date
    const copyPasteCode = pixData.qr_code || pixData.qrCode || pixData.brCode || pixData.copyPasteCode
    const qrCodeImageUrl = pixData.url || pixData.qrCodeUrl

    console.log('Parsed response:', {
      chargeId,
      status,
      expiresAt,
      hasCopyPasteCode: !!copyPasteCode,
      hasQrCodeUrl: !!qrCodeImageUrl,
    })

    // Save to database
    const chargeRecord = {
      id: `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order_id: orderId,
      charge_id: String(chargeId),
      status: status.toLowerCase(),
      expires_at: expiresAt || null,
      copy_paste_code: copyPasteCode || null,
      qr_code_base64: null, // AnubisPay doesn't return base64
      qr_code_image_url: qrCodeImageUrl || null,
      raw_response: data,
    }

    const { error: insertError } = await supabase
      .from('pix_charges')
      .insert(chargeRecord)

    if (insertError) {
      console.error('Error saving charge to database:', insertError)
      // Continue anyway - the charge was created in AnubisPay
    }

    console.log('PIX charge created successfully:', chargeId)

    return new Response(
      JSON.stringify({
        success: true,
        charge: {
          chargeId: String(chargeId),
          status: status.toLowerCase(),
          expiresAt: expiresAt,
          copyPasteCode: copyPasteCode,
          qrCodeBase64: null,
          qrCodeImageUrl: qrCodeImageUrl,
          rawResponse: data,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating PIX charge:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create PIX charge' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
