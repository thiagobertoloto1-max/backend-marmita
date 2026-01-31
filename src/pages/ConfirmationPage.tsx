import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Copy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logoreal.webp";

const API_BASE = "https://signs-section-television-accounting.trycloudflare.com";

/**
 * ✅ TESTE: 1 minuto (depois você volta para 10*60)
 */
const TIMER_SECONDS = 10 * 60;

type PixData = {
  qr_code: string;
  url: string | null;
  expiration_date: string;
  e2_e: string | null;
};

type LocationState = {
  pix?: PixData;
  pedido_id?: number;
  transacao_id?: string;
  total_reais?: string;
  customerName?: string;
};

type PedidoResponse = {
  id: number;
  nome: string;
  telefone: string;
  valor: number;
  status: string; // "AGUARDANDO" | "PAGO"
  transacao_id: string;
  items?: string;
  total_cents?: number;
  // se você já salva no backend:
  // pix_qr_code?: string;
};

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function useFixedCountdown(pedidoId: number, seed: string) {
  const storageKey = useMemo(() => `pix_timer_start_${pedidoId}_${seed}`, [pedidoId, seed]);
  const [secondsLeft, setSecondsLeft] = useState<number>(TIMER_SECONDS);

  useEffect(() => {
    if (!Number.isFinite(pedidoId)) return;

    let start = Number(localStorage.getItem(storageKey));
    if (!start || Number.isNaN(start)) {
      start = Date.now();
      localStorage.setItem(storageKey, String(start));
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = TIMER_SECONDS - elapsed;
      setSecondsLeft(left <= 0 ? 0 : left);
    };

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [pedidoId, storageKey]);

  return {
    text: formatMMSS(secondsLeft),
    isExpired: secondsLeft <= 0,
    restart: () => {
      const now = Date.now();
      localStorage.setItem(storageKey, String(now));
      setSecondsLeft(TIMER_SECONDS);
    },
  };
}

const ConfirmationPage: React.FC = () => {
  const params = useParams();
  const pedidoId = Number((params as any).id || (params as any).orderId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const { toast } = useToast();

  const [pedido, setPedido] = useState<PedidoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState("");

  // ✅ novo: estado de “gerando novo pix” pra dar sensação real
  const [isGeneratingNewPix, setIsGeneratingNewPix] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(pedidoId)) {
      setErro("Pedido inválido.");
      setIsLoading(false);
      return;
    }

    const fetchPedido = async () => {
      try {
        const resp = await fetch(`${API_BASE}/pedido/${pedidoId}`);
        const data = await resp.json();

        if (!resp.ok) {
          setErro(data?.erro || "Pedido não encontrado.");
          return;
        }

        setPedido(data);
      } catch {
        setErro("Erro de conexão ao buscar pedido.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedido();
  }, [pedidoId]);

  useEffect(() => {
  if (!Number.isFinite(pedidoId)) return;

  const interval = setInterval(async () => {
    try {
      const resp = await fetch(`${API_BASE}/pedido/${pedidoId}`);
      const data = await resp.json();
      if (!resp.ok) return;

      setPedido(data);
      if (data.status === "PAGO") clearInterval(interval);
    } catch {
      // ignora
    }
  }, 3000);

  return () => clearInterval(interval);
}, [pedidoId]);

  useEffect(() => {
  if (pedido?.status === "PAGO") {
    navigate(`/tracking/${pedidoId}`);
  }

}, [pedido?.status, pedidoId, navigate]);

useEffect(() => {
  if (
    window.location.hostname === "localhost" &&
    searchParams.get("paid") === "1"
  ) {
    navigate(`/tracking/${pedidoId}`);
  }
}, [searchParams, pedidoId, navigate]);
  const qrText = useMemo(() => {
    if (state?.pix?.qr_code) return state.pix.qr_code;
    const anyPedido: any = pedido;
    if (anyPedido?.pix_qr_code) return anyPedido.pix_qr_code as string;
    return "";
  }, [state?.pix?.qr_code, pedido]);

  const totalReais = useMemo(() => {
    if (!pedido) return "";
    if (typeof pedido.total_cents === "number") return (pedido.total_cents / 100).toFixed(2);
    if (typeof pedido.valor === "number") return pedido.valor.toFixed(2);
    return "";
  }, [pedido]);

  const isPaid = pedido?.status === "PAGO";

  const timerSeed = useMemo(() => {
    const tid = state?.transacao_id || pedido?.transacao_id;
    if (tid) return tid;
    if (qrText) return qrText.slice(0, 24);
    return "seed";
  }, [state?.transacao_id, pedido?.transacao_id, qrText]);

  const timer = useFixedCountdown(pedidoId, timerSeed);

  const handleCopyPixCode = async () => {
    if (!qrText) return;
    try {
      await navigator.clipboard.writeText(qrText);
      toast({ title: "Código PIX copiado!", description: "Cole no app do seu banco para pagar." });
    } catch {
      toast({
        title: "Não consegui copiar",
        description: "Copie manualmente o código PIX.",
        variant: "destructive",
      });
    }
  };

  /**
   * ✅ Novo comportamento:
   * - botão fica desativado
   * - texto muda para "Gerando novo PIX..."
   * - espera 3s
   * - recarrega (timer reinicia)
   * - toast aparece depois do reload (mantido)
   */
  const handleNewPix = () => {
    if (isGeneratingNewPix) return;

    setIsGeneratingNewPix(true);

    sessionStorage.setItem("pix_new_generated_toast", "1");
    timer.restart();

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  useEffect(() => {
    const flag = sessionStorage.getItem("pix_new_generated_toast");
    if (flag === "1") {
      sessionStorage.removeItem("pix_new_generated_toast");
      toast({ title: "Novo PIX gerado", description: "Escaneie o QR Code para pagar." });
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-[#2B2B2B]">
          <Clock className="w-5 h-5" />
          <span>Carregando pagamento…</span>
        </div>
      </div>
    );
  }

  if (erro || !pedido) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-[#2B2B2B]">Pedido não encontrado</h1>
        <p className="mt-2 text-sm text-[#2B2B2B]/70">
          O pedido que você procura não existe ou não pôde ser carregado.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-lg mx-auto p-4">
        <div className="rounded-2xl border border-[#EDEDED] bg-[#F9F9F9] p-5">
          {/* LOGO + selo discreto */}
<div className="flex flex-col items-center mb-4">
  <img
    src={logo}
    alt="Divino Sabor Marmitas"
    className="opacity-95"
    style={{ width: 72, height: "auto", objectFit: "contain" }}
  />
  <div className="text-xs text-[#2B2B2B]/60 mt-2">
    Ambiente oficial de pagamento
  </div>
</div>
          <div className="text-[#2B2B2B]">
            <div className="text-base font-bold flex items-center gap-2">
              <span style={{ color: "#FF9800" }}>💳</span> Pagamento via PIX
            </div>
            <div className="mt-1 text-sm text-[#2B2B2B]/75">
              📸 Escaneie agora pelo app do banco
            </div>
          </div>

          <div className="flex justify-center mt-4">
            {qrText ? (
              <img
                alt="QR Code PIX"
                className="rounded-xl bg-white p-2 shadow-sm border border-[#EDEDED]"
                style={{ width: 300, height: 300 }}
                src={
                  "https://api.qrserver.com/v1/create-qr-code/?" +
                  "size=300x300&data=" +
                  encodeURIComponent(qrText)
                }
              />
            ) : (
              <div className="text-sm text-[#2B2B2B]/70 mt-4">
                Não encontrei o QR Code (pode ter sido um refresh). Volte e gere o Pix novamente.
              </div>
            )}
          </div>

          {!isPaid && qrText && (
            <div className="mt-4 rounded-2xl border border-[#EDEDED] bg-white p-4">
              <div className="text-sm font-semibold text-[#2B2B2B]">
                Ou se preferir, use o código Copia e Cola do PIX:
              </div>

              <div
                className="mt-3 rounded-xl p-3 bg-[#F9F9F9] border border-[#EDEDED] break-all"
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: 12,
                  color: "#2B2B2B",
                }}
              >
                {qrText}
              </div>

              <Button
                className="w-full mt-3 font-semibold"
                style={{ background: "#FF9800", color: "#fff" }}
                onClick={handleCopyPixCode}
              >
                <Copy className="w-4 h-4 mr-2" />
                📋 Copiar código PIX para pagar
              </Button>
            </div>
          )}

          {!isPaid && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2 text-sm text-[#2B2B2B]/80">
                <Clock className="w-4 h-4" style={{ color: "#FF9800" }} />
                <span>Este QR Code expira em:</span>
                <b className="text-[#2B2B2B]">{timer.text}</b>
              </div>

              {timer.isExpired && (
                <Button
                  className="w-full font-semibold"
                  style={{
                    background: isGeneratingNewPix ? "#CFCFCF" : "#FF9800",
                    color: "#fff",
                    cursor: isGeneratingNewPix ? "not-allowed" : "pointer",
                  }}
                  disabled={isGeneratingNewPix}
                  onClick={handleNewPix}
                >
                  {isGeneratingNewPix ? "Gerando novo PIX..." : "QR Code expirado. Gerar novo PIX"}
                </Button>
              )}
            </div>
          )}

          {/* ✅ Status com bolinha laranja piscando */}
          <div className="mt-4 text-center text-sm text-[#2B2B2B]/70">
            {isPaid ? (
              <span className="font-semibold text-green-700">✅ Pagamento confirmado</span>
            ) : (
              <span className="font-semibold inline-flex items-center justify-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ background: "#FF9800" }}
                />
                Aguardando pagamento…
              </span>
            )}

            {totalReais && (
              <div className="mt-1">
                Total: <b className="text-[#2B2B2B]">R$ {totalReais}</b>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#EDEDED] bg-[#F9F9F9] p-5 mt-4">
          <div className="text-sm font-semibold text-[#2B2B2B]">🔔 Após o pagamento:</div>
          <div className="mt-3 grid gap-2 text-sm text-[#2B2B2B]/85">
            <div>✔ Confirmação automática</div>
            <div>✔ Pedido entra em preparo</div>
            <div>✔ Atualizações de status do pedido</div>
            <div>✔ Você terá contato com a loja por chat</div>
          </div>

          <div className="mt-4 text-sm text-[#2B2B2B] font-semibold">
            ✅ Pagamento 100% seguro via PIX
          </div>
          <div className="text-sm text-[#2B2B2B]/70">
            Confirmação automática pelo sistema bancário.
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-sm font-semibold text-[#2B2B2B]">🍽 Divino Sabor Marmitas</div>
          <div className="text-xs text-[#2B2B2B]/70">
            Comida caseira • Entrega rápida • Atendimento local
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfirmationPage;