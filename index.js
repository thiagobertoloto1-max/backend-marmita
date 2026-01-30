require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

// JSON do body
app.use(express.json());

// CORS simples (sem OPTIONS wildcard)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * CATÁLOGO FIXO (fonte de verdade do preço)
 * - SKU é o identificador que o front envia
 * - unit_price_cents é o preço em centavos
 *
 * Você pode alterar nomes/preços depois.
 */
const CATALOGO = {
  marmita_frango: { title: "Marmita de Frango", unit_price_cents: 1990, tangible: true },
  marmita_carne:  { title: "Marmita de Carne",  unit_price_cents: 2190, tangible: true },
  marmita_fit:    { title: "Marmita Fit",       unit_price_cents: 2390, tangible: true },
};

// Util: valida telefone/CPF minimamente (MVP)
function onlyDigits(s) {
  return String(s || "").replace(/\D+/g, "");
}

/* Criar pagamento PIX (ANTI-FRAUDE: total calculado no backend) */
app.post("/create-payment", async (req, res) => {
  const { nome, telefone, cpf, items } = req.body;

  // Validação básica
  if (!nome || !telefone || !cpf || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      erro: "Dados incompletos. Envie: nome, telefone, cpf e items[]",
    });
  }

  const cpfDigits = onlyDigits(cpf);
  const phone = String(telefone).trim();

  if (cpfDigits.length !== 11) {
    return res.status(400).json({ erro: "CPF inválido (precisa ter 11 dígitos)" });
  }

  // Calcula total e monta items para AnubisPay
  let total_cents = 0;

  // items do front: [{ sku, qty }]
  for (const it of items) {
    const sku = it?.sku;
    const qty = Number(it?.qty);

    if (!sku || !Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ erro: "Item inválido. Use { sku, qty>=1 }" });
    }

    const produto = CATALOGO[sku];
    if (!produto) {
      return res.status(400).json({ erro: `SKU inválido: ${sku}` });
    }

    total_cents += produto.unit_price_cents * qty;
  }

  // Se quiser impor mínimo (muitos gateways têm mínimo)
  // Exemplo: mínimo R$ 10,00:
  // if (total_cents < 1000) return res.status(400).json({ erro: "Pedido mínimo: R$ 10,00" });

  const amount = total_cents; // centavos (inteiro)

  // Basic Auth Base64: PUBLIC:SECRET
  const auth = Buffer.from(
    `${process.env.ANUBIS_PUBLIC_KEY}:${process.env.ANUBIS_SECRET_KEY}`
  ).toString("base64");

  try {
    const response = await fetch(
      "https://api2.anubispay.com.br/v1/payment-transaction/create",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount,
          payment_method: "pix",
          postback_url: "https://backend-marmita.onrender.com/webhook/anubispay",
          customer: {
            name: nome,
            email: "cliente@teste.com", // MVP
            phone,
            document: {
              type: "cpf",
              number: cpfDigits,
            },
          },

          // Items reais do pedido (preço vem do backend)
          items: items.map((it) => {
            const produto = CATALOGO[it.sku];
            return {
              title: produto.title,
              unit_price: produto.unit_price_cents,
              quantity: Number(it.qty),
              tangible: produto.tangible,
            };
          }),

          pix: { expires_in_days: 1 },
          metadata: { provider_name: "checkout-marmita" },
        }),
      }
    );

    const data = await response.json();

    console.log("STATUS ANUBIS:", response.status);
    console.log("RESPOSTA ANUBIS:", JSON.stringify(data, null, 2));

    const transacaoId = data?.data?.id;

    // Se a API respondeu erro de validação/autenticação, devolve detalhes
    if (!response.ok || !transacaoId) {
      return res.status(400).json({
        erro: "Falha ao criar transação na AnubisPay",
        detalhes: data,
      });
    }

    // Salva no SQLite (inclui items e total_cents)
    db.run(
      "INSERT INTO pedidos (nome, telefone, valor, status, transacao_id, items, total_cents) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nome,
        phone,
        amount / 100, // valor em reais (só pra exibir)
        "AGUARDANDO",
        transacaoId,
        JSON.stringify(items),
        amount,
      ],
      function (err) {
        if (err) {
          console.error("Erro ao salvar pedido:", err);
          return res.status(500).json({ erro: "Erro ao salvar pedido" });
        }

        return res.json({
          pedido_id: this.lastID,
          transacao_id: transacaoId,
          total_cents: amount,
          total_reais: (amount / 100).toFixed(2),
          pix: data?.data?.pix,
        });
      }
    );
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res.status(500).json({ erro: "Erro ao criar pagamento" });
  }
});

/* Webhook (AnubisPay chama quando muda status) */
app.post("/webhook/anubispay", (req, res) => {
  console.log("WEBHOOK RECEBIDO:", req.body);

  const transacaoId = req.body.Id || req.body.id;
  const status = req.body.Status || req.body.status;

  if (status === "PAID" && transacaoId) {
    db.run(
      "UPDATE pedidos SET status = 'PAGO' WHERE transacao_id = ?",
      [transacaoId],
      function (err) {
        if (err) {
          console.error("Erro ao atualizar pedido:", err);
        } else {
          console.log("Pedido marcado como PAGO:", transacaoId);
        }
      }
    );
  }

  return res.sendStatus(200);
});

/* Buscar pedido por ID do SQLite */
app.get("/pedido/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id, nome, telefone, valor, status, transacao_id, items, total_cents FROM pedidos WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar pedido:", err);
        return res.status(500).json({ erro: "Erro ao buscar pedido" });
      }
      if (!row) {
        return res.status(404).json({ erro: "Pedido não encontrado" });
      }
      return res.json(row);
    }
  );
});

/* Buscar pedido pelo ID grandão da AnubisPay */
app.get("/transacao/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id, nome, telefone, valor, status, transacao_id, items, total_cents FROM pedidos WHERE transacao_id = ?",
    [id],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar transação:", err);
        return res.status(500).json({ erro: "Erro ao buscar transação" });
      }
      if (!row) {
        return res.status(404).json({ erro: "Transação não encontrada" });
      }
      return res.json(row);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});