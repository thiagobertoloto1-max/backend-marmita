import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function json(res: any, status: number, body: any) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function getBasicAuthHeader() {
  const pub = process.env.ANUBISPAY_PUBLIC_KEY;
  const sec = process.env.ANUBISPAY_SECRET_KEY;
  if (!pub || !sec) throw new Error("Missing ANUBISPAY_PUBLIC_KEY/ANUBISPAY_SECRET_KEY");
  const token = Buffer.from(`${pub}:${sec}`).toString("base64");
  return `Basic ${token}`;
}

export function getBaseUrl() {
  return process.env.ANUBISPAY_BASE_URL || "https://api2.anubispay.com.br";
}
