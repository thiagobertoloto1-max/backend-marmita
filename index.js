// index.js (VERSÃO LIMPA E CORRETA PRA COPIAR/COLAR)

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

// ✅ JSON do body
app.use(express.json());

// ✅ CORS (sem app.options e sem duplicar app.use(cors()))
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* Criar pagamento PIX */
app.post("/create-payment", async (req, res) => {
  const { nome, telefone, cpf, valor } = req.body;

  // Validação básica
  if (!nome || !telefone || !cpf || !valor) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  const amount = Math.round(Number(valor) * 100); // centavos (inteiro)

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
            email: "cliente@teste.com", // (MVP) depois você coloca um email real do cliente
            phone: telefone,
            document: {
              type: "cpf",
              number: cpf,
            },
          },
          items: [
            {
              title: "Marmita",
              unit_price: amount,
              quantity: 1,
              tangible: true,
            },
          ],
          pix: { expires_in_days: 1 },
          metadata: { provider_name: "checkout-marmita" },
        }),
      }
    );

    const data = await response.json();

console.log("STATUS ANUBIS:", response.status);
console.log("RESPOSTA ANUBIS:", JSON.stringify(data, null, 2));

const transacaoId = data?.data?.id;

// Se a API respondeu erro de validação/autenticação, devolve a resposta pra você enxergar
if (!response.ok || !transacaoId) {
  return res.status(400).json({
    erro: "Falha ao criar transação na AnubisPay",
    detalhes: data
  });
}

    db.run(
      "INSERT INTO pedidos (nome, telefone, valor, status, transacao_id) VALUES (?, ?, ?, ?, ?)",
      [nome, telefone, Number(valor), "AGUARDANDO", transacaoId],
      function (err) {
        if (err) {
          console.error("Erro ao salvar pedido:", err);
          return res.status(500).json({ erro: "Erro ao salvar pedido" });
        }

        return res.json({
          pedido_id: this.lastID,
          transacao_id: transacaoId,
          pix: data?.data?.pix,
        });
      }
    );
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res.status(500).json({ erro: "Erro ao criar pagamento" });
  }
});

/* Webhook (AnubisPay chama aqui quando muda status) */
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
    "SELECT id, nome, telefone, valor, status, transacao_id FROM pedidos WHERE id = ?",
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
    "SELECT id, nome, telefone, valor, status, transacao_id FROM pedidos WHERE transacao_id = ?",
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
