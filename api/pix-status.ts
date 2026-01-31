import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin, json, getBasicAuthHeader, getBaseUrl } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const transactionId = String(req.query.transactionId || "");
  if (!transactionId) return json(res, 400, { error: "Missing transactionId" });

  const supabase = getSupabaseAdmin();
  const baseUrl = getBaseUrl();
  const auth = getBasicAuthHeader();

  const r = await fetch(`${baseUrl}/v1/payment-transaction/info/${transactionId}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: auth,
    },
  });

  const text = await r.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!r.ok) return json(res, r.status, { error: "AnubisPay error", details: data || text || null });

  const status = data?.data?.status;
  const paidAt = data?.data?.paid_at || null;

  // Se pago, atualiza order + payments
  if (status === "PAID" || status === "CONFIRMED" || status === "APPROVED") {
    // tenta achar order_id via payments
    const { data: payRow } = await supabase.from("payments")
      .select("order_id")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (payRow?.order_id) {
      await supabase.from("payments").update({
        payment_status: "PAID",
        paid_at: paidAt,
      }).eq("order_id", payRow.order_id);

      await supabase.from("orders").update({
        order_status: "payment_confirmed",
      }).eq("id", payRow.order_id);
    }
  }

  return json(res, 200, { status, paidAt, raw: data });
}
