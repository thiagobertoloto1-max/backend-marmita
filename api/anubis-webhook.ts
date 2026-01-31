import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin, json } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const supabase = getSupabaseAdmin();
  const payload = req.body;

  // Ajuste conforme o payload real do postback:
  const txId = payload?.data?.id || payload?.transaction_id || payload?.id;
  const status = payload?.data?.status || payload?.status;

  if (!txId) return json(res, 400, { error: "Missing transaction id" });

  // Tenta achar payment por transaction_id
  const { data: payRow } = await supabase.from("payments")
    .select("order_id")
    .eq("transaction_id", txId)
    .maybeSingle();

  if (!payRow?.order_id) {
    // corrida: webhook chegou antes do create salvar
    // salva payload para conciliar depois
    await supabase.from("payments").upsert({
      order_id: `unknown_${txId}`,
      transaction_id: txId,
      provider: "anubispay",
      payment_status: status || "PENDING",
      raw_webhook_payload: payload,
    });
    return json(res, 200, { ok: true, note: "Webhook received before create" });
  }

  if (status === "PAID" || status === "CONFIRMED" || status === "APPROVED") {
    await supabase.from("payments").update({
      payment_status: "PAID",
      raw_webhook_payload: payload,
      paid_at: new Date().toISOString(),
    }).eq("order_id", payRow.order_id);

    await supabase.from("orders").update({
      order_status: "payment_confirmed",
    }).eq("id", payRow.order_id);
  }

  return json(res, 200, { ok: true });
}
