import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const chargeId = url.searchParams.get('chargeId')

    if (!chargeId) {
      return new Response(
        JSON.stringify({ success: false, error: 'chargeId is required' }),
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

    // Build auth header
    const authString = btoa(`${publicKey}:${secretKey}`)

    console.log('=== PIX STATUS CHECK ===')
    console.log('Charge ID:', chargeId)

    // Call AnubisPay API to check status
    // Using info/{id} endpoint as per common API patterns
    const response = await fetch(`https://api2.anubispay.com.br/v1/payment-transaction/${chargeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    console.log('Status Response:', response.status, response.statusText)

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
          error: data.message || data.error || `Payment gateway error: ${response.status}` 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract status from response - AnubisPay uses PascalCase
    const responseData = data.data || data
    const status = responseData.Status || responseData.status || 'pending'
    const paidAt = responseData.PaidAt || responseData.paidAt || responseData.paid_at || responseData.confirmedAt
    
    // Normalize status check
    const normalizedStatus = String(status).toLowerCase()
    const isPaid = normalizedStatus === 'paid' || normalizedStatus === 'confirmed' || 
                   normalizedStatus === 'completed' || normalizedStatus === 'approved'

    console.log('Parsed status:', { status, normalizedStatus, isPaid, paidAt })

    // Update database if status changed
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const updateData: Record<string, unknown> = { status: normalizedStatus }
    if (paidAt) {
      updateData.paid_at = paidAt
    }

    const { data: chargeRecord, error: updateError } = await supabase
      .from('pix_charges')
      .update(updateData)
      .eq('charge_id', chargeId)
      .select('order_id')
      .maybeSingle()

    if (updateError) {
      console.error('Error updating charge status:', updateError)
    }

    // If paid, update order status
    if (isPaid && chargeRecord?.order_id) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'payment_confirmed' })
        .eq('id', chargeRecord.order_id)

      if (orderError) {
        console.error('Error updating order status:', orderError)
      } else {
        console.log('Order status updated to payment_confirmed:', chargeRecord.order_id)
      }
    }

    console.log('PIX status check complete:', { chargeId, status: normalizedStatus, isPaid })

    return new Response(
      JSON.stringify({
        success: true,
        status: normalizedStatus,
        isPaid: isPaid,
        paidAt: paidAt || null,
        rawResponse: data,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error checking PIX status:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check PIX status' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
