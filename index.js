require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());


app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

app.options("*", cors());


/* Criar pagamento PIX */
app.post("/create-payment", async (req, res) => {
  const { nome, telefone, cpf, valor } = req.body;

  // 🔎 Validação básica
  if (!nome || !telefone || !cpf || !valor) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  // Valor em centavos
  const amount = Math.round(valor * 100);

  // Basic Auth Base64
  const auth = Buffer.from(
    `${process.env.ANUBIS_PUBLIC_KEY}:${process.env.ANUBIS_SECRET_KEY}`
  ).toString("base64");

  try {
    const response = await fetch(
      "https://api2.anubispay.com.br/v1/payment-transaction/create",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          amount: amount,
          payment_method: "pix",
          postback_url: "https://backend-marmita.onrender.com/webhook/anubispay",
          customer: {
            name: nome,
            email: "cliente@teste.com",
            phone: telefone,
            document: {
              type: "cpf",
              number: cpf
            }
          },
          items: [
            {
              title: "Marmita",
              unit_price: amount,
              quantity: 1,
              tangible: true
            }
          ],
          pix: {
            expires_in_days: 1
          },
          metadata: {
            provider_name: "checkout-marmita"
          }
        })
      }
    );

    const data = await response.json();
    const transacaoId = data?.data?.id;

    db.run(
      "INSERT INTO pedidos (nome, telefone, valor, status, transacao_id) VALUES (?, ?, ?, ?, ?)",
      [nome, telefone, valor, "AGUARDANDO", transacaoId],
      function (err) {
        if (err) {
          console.error("Erro ao salvar pedido:", err);
          return res.status(500).json({ erro: "Erro ao salvar pedido" });
        }

        return res.json({
          pedido_id: this.lastID,
          transacao_id: transacaoId,
          pix: data?.data?.pix
        });
      }
    );

  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res.status(500).json({ erro: "Erro ao criar pagamento" });
  }
});



/* Webhook */
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

  res.sendStatus(200);
});


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
