import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin, json, getBasicAuthHeader, getBaseUrl } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const supabase = getSupabaseAdmin();
  const baseUrl = getBaseUrl();
  const auth = getBasicAuthHeader();

  const { orderId, amount, customer, items } = req.body || {};
  if (!orderId || !amount || !customer?.name || !customer?.phone || !Array.isArray(items) || items.length < 1) {
    return json(res, 400, { error: "Missing required fields" });
  }
  if (!customer?.cpf) {
    return json(res, 400, { error: "CPF is required for PIX" });
  }

  const postbackUrl = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/anubis-webhook`;

  const body = {
    amount, // centavos
    payment_method: "pix",
    postback_url: postbackUrl,
    customer: {
      name: customer.name,
      email: customer.email || undefined,
      phone: customer.phone,
      document: { type: "cpf", number: customer.cpf },
    },
    items: items.map((it: any) => ({
      title: it.title,
      unit_price: it.unit_price,
      quantity: it.quantity,
      tangible: it.tangible ?? true,
      external_ref: it.external_ref ?? orderId,
    })),
    metadata: {
      orderId,
      source: "vercel",
    },
  };

  const r = await fetch(`${baseUrl}/v1/payment-transaction/create`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: auth,
    },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!r.ok) {
    return json(res, r.status, { error: "AnubisPay error", details: data || text || null });
  }

  const txId = data?.data?.id;
  const status = data?.data?.status;
  const copyPaste = data?.data?.pix?.qr_code;
  const expiration = data?.data?.pix?.expiration_date;

  // Salva/atualiza pagamento no banco (UPSERT por order_id)
  const { error } = await supabase.from("payments").upsert({
    order_id: orderId,
    provider: "anubispay",
    transaction_id: txId,
    payment_status: status || "PENDING",
    copy_paste_code: copyPaste || null,
    expiration_date: expiration || null,
    raw_create_response: data,
  });

  if (error) return json(res, 500, { error: error.message });

  return json(res, 200, {
    transactionId: txId,
    status,
    copyPasteCode: copyPaste,
    expirationDate: expiration,
    postbackUrl,
  });
}
