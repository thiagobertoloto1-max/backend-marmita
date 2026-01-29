require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

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

    // Salva no banco
    db.run(
      "INSERT INTO pedidos (nome, telefone, valor, status, transacao_id) VALUES (?, ?, ?, ?, ?)",
      [nome, telefone, valor, "AGUARDANDO", data.id]
    );

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar pagamento" });
  }
});

/* Webhook */
app.post("/webhook/anubispay", (req, res) => {
  console.log("WEBHOOK RECEBIDO:", req.body);

  const { Id, Status } = req.body;

  if (Status === "PAID") {
    db.run(
      "UPDATE pedidos SET status = 'PAGO' WHERE transacao_id = ?",
      [Id]
    );
    console.log("Pedido marcado como PAGO:", Id);
  }

  res.sendStatus(200);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
