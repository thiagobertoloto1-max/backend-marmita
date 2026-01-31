import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-anubispay-signature',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.text()
    console.log('=== WEBHOOK RECEIVED ===')
    console.log('Body:', body)
    console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2))

    let data
    try {
      data = JSON.parse(body)
    } catch {
      console.error('Invalid JSON in webhook body')
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log webhook signature for debugging
    const signatureHeader = req.headers.get('x-webhook-signature') || 
                           req.headers.get('x-anubispay-signature') ||
                           req.headers.get('x-signature')
    console.log('Webhook signature header:', signatureHeader)

    if (!signatureHeader) {
      console.warn('No signature header found - proceeding without validation')
    }

    // AnubisPay webhook payload uses PascalCase based on logs:
    // { Id, Status, Amount, PaidAt, ExternalId, PaymentMethod, PostbackUrl, ... }
    const chargeId = data.Id || data.id || data.txid || data.transactionId || 
                     data.transaction?.id || data.data?.id || 
                     data.paymentId
    
    const status = data.Status || data.status || data.transaction?.status || data.data?.status || 'unknown'
    const paidAt = data.PaidAt || data.paidAt || data.paid_at || data.confirmedAt || 
                   data.transaction?.paidAt || data.data?.paidAt
    const externalId = data.ExternalId || data.externalId || data.external_id

    console.log('Parsed webhook data:', {
      chargeId,
      status,
      paidAt,
      externalId,
    })

    if (!chargeId) {
      console.error('No charge ID found in webhook payload:', data)
      // Return 200 to prevent retries even if we can't process
      return new Response(
        JSON.stringify({ received: true, processed: false, reason: 'No charge ID found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing webhook for charge:', chargeId, 'status:', status)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Normalize status - AnubisPay uses UPPERCASE
    const normalizedStatus = String(status).toLowerCase()
    const isPaid = normalizedStatus === 'paid' || normalizedStatus === 'confirmed' || 
                   normalizedStatus === 'completed' || normalizedStatus === 'approved'
    const isExpired = normalizedStatus === 'expired' || normalizedStatus === 'cancelled'

    console.log('Status analysis:', { normalizedStatus, isPaid, isExpired })

    // Update pix_charges table
    const updateData: Record<string, unknown> = { 
      status: normalizedStatus,
      raw_response: data,
    }
    
    if (paidAt) {
      updateData.paid_at = paidAt
    } else if (isPaid) {
      updateData.paid_at = new Date().toISOString()
    }

    const { data: chargeRecord, error: updateError } = await supabase
      .from('pix_charges')
      .update(updateData)
      .eq('charge_id', String(chargeId))
      .select('order_id')
      .maybeSingle()

    if (updateError) {
      console.error('Error updating charge:', updateError)
    }

    console.log('Charge record found:', chargeRecord)

    // Update order status based on payment status
    if (chargeRecord?.order_id) {
      let newOrderStatus = null
      
      if (isPaid) {
        newOrderStatus = 'payment_confirmed'
      } else if (isExpired) {
        newOrderStatus = 'cancelled'
      }

      if (newOrderStatus) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: newOrderStatus })
          .eq('id', chargeRecord.order_id)

        if (orderError) {
          console.error('Error updating order status:', orderError)
        } else {
          console.log('Order status updated to', newOrderStatus, 'for order:', chargeRecord.order_id)
        }
      }
    }

    console.log('Webhook processed successfully for charge:', chargeId)

    // Always return 200 quickly to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true, processed: true, chargeId, status: normalizedStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    // Return 200 to prevent retries - log the error for debugging
    return new Response(
      JSON.stringify({ received: true, processed: false, error: 'Internal error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
