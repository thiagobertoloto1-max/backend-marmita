import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, CookingPot, Bike, Clock, HelpCircle, X } from "lucide-react";
import logo from "@/assets/logoreal.webp";

type Stage = 1 | 2 | 3;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatEta(mins: number) {
  return `${mins}–${mins + 10} min`;
}

type OrderMeta = {
  restaurantName?: string;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
  items?: Array<{
    name: string;
    size?: string;
    qty: number;
    price: number;
  }>;
  totalReais?: string;
  createdAt?: string;
};

export default function OrderTrackingPage() {
  const params = useParams();
  const pedidoId = String((params as any).id);

  // Persistência por pedido (status simulado)
  const simKey = useMemo(() => `tracking_sim_${pedidoId}`, [pedidoId]);

  const [stage, setStage] = useState<Stage>(1);
  const [etaMin, setEtaMin] = useState<number>(35);

  // Ajuda (modal simples)
  const [helpOpen, setHelpOpen] = useState(false);

  // Resumo do pedido (vem do localStorage salvo no checkout)
  const [meta, setMeta] = useState<OrderMeta | null>(null);

  const baseProgress = stage === 1 ? 33 : stage === 2 ? 66 : 100;

  // Carrega meta do pedido (itens/endereço/pagamento)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`order_meta_${pedidoId}`);
      if (raw) setMeta(JSON.parse(raw));
    } catch {
      // ignora
    }
  }, [pedidoId]);

  // Inicializa simulação persistente
  useEffect(() => {
    const raw = localStorage.getItem(simKey);

    if (raw) {
      const saved = JSON.parse(raw);
      setEtaMin(saved.etaMin ?? 35);

      const now = Date.now();
      if (now >= saved.stage3Ts) setStage(3);
      else if (now >= saved.stage2Ts) setStage(2);
      else setStage(1);
      return;
    }

    const startTs = Date.now();
    const stage2Ts = startTs + 10_000; // 10s
    const randomMinutes = getRandomInt(30, 45);
    const stage3Ts = startTs + randomMinutes * 60_000;

    const payload = { startTs, stage2Ts, stage3Ts, etaMin: randomMinutes };
    localStorage.setItem(simKey, JSON.stringify(payload));

    setEtaMin(randomMinutes);
    setStage(1);
  }, [simKey]);

  // Atualiza stage automaticamente
  useEffect(() => {
    const t = setInterval(() => {
      const raw = localStorage.getItem(simKey);
      if (!raw) return;

      const saved = JSON.parse(raw);
      const now = Date.now();

      if (now >= saved.stage3Ts) setStage(3);
      else if (now >= saved.stage2Ts) setStage(2);
      else setStage(1);
    }, 1000);

    return () => clearInterval(t);
  }, [simKey]);

  const restaurantName = meta?.restaurantName || "Divino Sabor Marmitas";
  const paymentMethod = meta?.paymentMethod || "PIX";

  const addressText = useMemo(() => {
    if (!meta?.address) return null;
    const a = meta.address;
    const line1 = `${a.street || ""}, ${a.number || ""}`.trim();
    const line2 = `${a.neighborhood || ""} • ${a.city || ""}-${a.state || ""}`.trim();
    const line3 = a.complement ? `Compl.: ${a.complement}` : "";
    const line4 = a.zipCode ? `CEP: ${a.zipCode}` : "";
    return [line1, line2, line3, line4].filter(Boolean);
  }, [meta?.address]);

  return (
    <div className="min-h-screen bg-white p-4 flex justify-center">
      <div className="w-full max-w-md space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[#2B2B2B]">ACOMPANHE SEU PEDIDO</div>

          <button
            className="text-sm text-[#FF9800] flex items-center gap-1"
            onClick={() => setHelpOpen(true)}
            type="button"
          >
            <HelpCircle className="w-4 h-4" />
            Ajuda
          </button>
        </div>

        {/* Header card */}
        <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt={restaurantName} className="w-10 h-10 rounded-full border border-[#EDEDED]" />
            <div className="flex-1">
              <div className="font-semibold text-[#2B2B2B]">{restaurantName}</div>
              <div className="text-xs text-[#2B2B2B]/60">Pagamento: {paymentMethod}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-[#2B2B2B]/60">Previsão de entrega</div>
            <div className="text-3xl font-extrabold text-[#2B2B2B]">
              {formatEta(etaMin)}
            </div>
          </div>

          {/* Barra iFood-like (verde, sem multi-cores) */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-[#F1F1F1] overflow-hidden relative">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${baseProgress}%`,
                  background: "#18A957",
                }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: "#18A957",
                  opacity: 0.35,
                  width: `${baseProgress}%`,
                  animation: "pulseToEnd 1.6s ease-in-out infinite",
                }}
              />
            </div>

            <style>{`
              @keyframes pulseToEnd {
                0%   { width: ${baseProgress}%; }
                50%  { width: 100%; }
                100% { width: ${baseProgress}%; }
              }
            `}</style>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-[#EDEDED] bg-[#F9F9F9] p-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-600 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#2B2B2B]">Pagamento confirmado</div>
                <div className="text-sm text-[#2B2B2B]/60">Concluído</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{
                  background: stage >= 2 ? "#18A957" : "#FF9800",
                }}
              >
                <CookingPot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#2B2B2B]">Pedido em preparo</div>
                <div className="text-sm text-[#2B2B2B]/60">
                  {stage >= 3 ? "Pedido concluído" : stage >= 2 ? "Em andamento" : "Iniciando…"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{
                  background: stage >= 3 ? "#18A957" : "#CFCFCF",
                }}
              >
                <Bike className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#2B2B2B]">Saiu para entrega</div>
                <div className="text-sm text-[#2B2B2B]/60">
                  {stage >= 3 ? "Em andamento" : "Aguardando"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#2B2B2B]/60">
            <Clock className="w-4 h-4" style={{ color: "#FF9800" }} />
            Atualização automática
          </div>
        </div>

        {/* Delivery address */}
        {addressText && (
          <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
            <div className="font-semibold text-[#2B2B2B]">Entrega em</div>
            <div className="mt-2 text-sm text-[#2B2B2B]/70 space-y-1">
              {addressText.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {/* Order details */}
        {meta?.items?.length ? (
          <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
            <div className="font-semibold text-[#2B2B2B]">Detalhes do pedido</div>

            <div className="mt-3 space-y-2 text-sm text-[#2B2B2B]/80">
              {meta.items.map((it, idx) => (
                <div key={idx} className="flex justify-between gap-3">
                  <div>
                    <div className="font-medium text-[#2B2B2B]">
                      {it.qty}x {it.name}{it.size ? ` (${it.size})` : ""}
                    </div>
                  </div>
                  <div className="text-[#2B2B2B]">
                    R$ {it.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {meta.totalReais && (
              <div className="mt-3 pt-3 border-t border-[#EDEDED] flex justify-between font-semibold text-[#2B2B2B]">
                <span>Total</span>
                <span>R$ {meta.totalReais}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Help modal (placeholder) */}
        {helpOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-end justify-center p-4 z-50">
            <div className="w-full max-w-md bg-white rounded-2xl border border-[#EDEDED] p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#2B2B2B]">Ajuda</div>
                <button onClick={() => setHelpOpen(false)} type="button">
                  <X className="w-5 h-5 text-[#2B2B2B]/70" />
                </button>
              </div>
              <div className="mt-2 text-sm text-[#2B2B2B]/70">
                Em breve você poderá falar com nosso bot aqui no chat.
              </div>
              <button
                className="w-full mt-4 rounded-xl py-3 font-semibold text-white"
                style={{ background: "#FF9800" }}
                onClick={() => setHelpOpen(false)}
                type="button"
              >
                Entendi
              </button>
            </div>
          </div>
        )}

        {/* Sem número do pedido, sem ligar */}
      </div>
    </div>
  );
}