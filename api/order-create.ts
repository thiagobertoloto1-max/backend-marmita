import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin, json } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const supabase = getSupabaseAdmin();
  const {
    orderId,
    customer,
    subtotal,
    deliveryFee,
    discount,
    total,
    paymentMethod,
  } = req.body || {};

  if (!orderId || !customer?.name || !customer?.phone || !total || !paymentMethod) {
    return json(res, 400, { error: "Missing required fields" });
  }

  const { error } = await supabase.from("orders").upsert({
    id: orderId,
    customer_name: customer.name,
    customer_email: customer.email || null,
    customer_phone: customer.phone,
    customer_cpf: customer.cpf || null,
    subtotal,
    delivery_fee: deliveryFee,
    discount,
    total,
    payment_method: paymentMethod,
    order_status: paymentMethod === "pix" ? "pending_payment" : "payment_confirmed",
  });

  if (error) return json(res, 500, { error: error.message });

  return json(res, 200, { ok: true });
}
