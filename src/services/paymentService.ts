// src/services/paymentService.ts
// Pagamento Pix via backend Render (AnubisPay) — versão estável + compatibilidade

const API_BASE = "https://signs-section-television-accounting.trycloudflare.com";

/* ------------------------------------------------------------------
   TIPOS
------------------------------------------------------------------ */

export type CartItemPayload = {
  sku: string;
  qty: number;
};

export type CreatePaymentPayload = {
  nome: string;
  telefone: string;
  cpf: string;
  items: CartItemPayload[];
};

export type CreatePaymentResponse = {
  pedido_id: number;
  transacao_id: string;
  total_cents: number;
  total_reais: string;
  pix: {
    qr_code: string;
    url: string | null;
    expiration_date: string;
    e2_e: string | null;
  };
};

export type PedidoStatusResponse = {
  id: number;
  nome: string;
  telefone: string;
  valor: number;
  status: "AGUARDANDO" | "PAGO" | string;
  transacao_id: string;
  items?: string;
  total_cents?: number;
};

/* ------------------------------------------------------------------
   FUNÇÕES PRINCIPAIS (BACKEND NOVO)
------------------------------------------------------------------ */

export async function criarPagamentoPix(
  payload: CreatePaymentPayload
): Promise<CreatePaymentResponse> {
  const resp = await fetch(`${API_BASE}/create-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(data?.erro || "Erro ao criar pagamento Pix");
  }

  return data as CreatePaymentResponse;
}

export async function consultarPedido(
  pedidoId: number
): Promise<PedidoStatusResponse> {
  const resp = await fetch(`${API_BASE}/pedido/${pedidoId}`);
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(data?.erro || "Erro ao consultar pedido");
  }

  return data as PedidoStatusResponse;
}

/* ------------------------------------------------------------------
   FUNÇÕES AUXILIARES
------------------------------------------------------------------ */

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

/* ------------------------------------------------------------------
   COMPATIBILIDADE COM CÓDIGO ANTIGO (aliases)
------------------------------------------------------------------ */

// criação de pagamento
export async function createPixPayment(payload: CreatePaymentPayload) {
  return criarPagamentoPix(payload);
}
export async function createPayment(payload: CreatePaymentPayload) {
  return criarPagamentoPix(payload);
}

// status/polling por pedidoId
export async function getOrderStatus(pedidoId: number) {
  return consultarPedido(pedidoId);
}
export async function getPaymentStatus(pedidoId: number) {
  return consultarPedido(pedidoId);
}
export async function pixStatus(pedidoId: number) {
  return consultarPedido(pedidoId);
}
export async function checkPixStatus(pedidoId: number) {
  return consultarPedido(pedidoId);
}

// ✅ O ConfirmationPage antigo provavelmente chamava isso (por "orderId").
// No nosso backend novo, a consulta é por pedido_id.
// Então aqui é um alias: você deve passar o pedido_id.
export async function getPixChargeByOrderId(orderId: number) {
  return consultarPedido(orderId);
}

/* ------------------------------------------------------------------
   EXPORT DEFAULT
------------------------------------------------------------------ */

export default {
  criarPagamentoPix,
  consultarPedido,
  createPixPayment,
  createPayment,
  getOrderStatus,
  getPaymentStatus,
  pixStatus,
  checkPixStatus,
  getPixChargeByOrderId,
  formatCurrency,
};