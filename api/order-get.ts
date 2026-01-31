import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin, json } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const orderId = String(req.query.orderId || "");
  if (!orderId) {
    return json(res, 400, { error: "Missing orderId" });
  }

  const supabase = getSupabaseAdmin();

  // Busca pedido
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    return json(res, 500, { error: orderError.message });
  }

  if (!order) {
    return json(res, 404, { error: "Order not found" });
  }

  // Busca pagamento (se existir)
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (paymentError) {
    return json(res, 500, { error: paymentError.message });
  }

  return json(res, 200, {
    order,
    payment,
  });
}
