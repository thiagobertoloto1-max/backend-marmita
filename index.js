require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

// JSON do body
app.use(express.json());

// CORS (permite seu domínio chamar o backend)
const ALLOWED_ORIGINS = [
  "https://www.divinosabor.shop",
  "https://divinosabor.shop",
  "http://localhost:5173",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // permite requests sem origin (ex: curl, postman)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// responder preflight (OPTIONS) pra tudo
app.options("*", cors());

// Catálogo completo (SKU = "productId:sizeId")
const CATALOGO = {
  // PROMO / COMBOS
  "promo_2_por_1:unico": { title: "2 por 1 🔥 (Combo 2 Marmitas M)", unit_price_cents: 2590, tangible: true },

  // TRADICIONAIS
  "almondegas_ao_molho:p": { title: "Almôndegas ao Molho (P)", unit_price_cents: 1990, tangible: true },
  "almondegas_ao_molho:m": { title: "Almôndegas ao Molho (M)", unit_price_cents: 2490, tangible: true },
  "almondegas_ao_molho:g": { title: "Almôndegas ao Molho (G)", unit_price_cents: 2990, tangible: true },

  "bife_acebolado:p": { title: "Bife Acebolado (P)", unit_price_cents: 2090, tangible: true },
  "bife_acebolado:m": { title: "Bife Acebolado (M)", unit_price_cents: 2590, tangible: true },
  "bife_acebolado:g": { title: "Bife Acebolado (G)", unit_price_cents: 3090, tangible: true },

  "carne_de_panela:p": { title: "Carne de Panela (P)", unit_price_cents: 2190, tangible: true },
  "carne_de_panela:m": { title: "Carne de Panela (M)", unit_price_cents: 2690, tangible: true },
  "carne_de_panela:g": { title: "Carne de Panela (G)", unit_price_cents: 3190, tangible: true },

  "churrasco:p": { title: "Churrasco (P)", unit_price_cents: 2390, tangible: true },
  "churrasco:m": { title: "Churrasco (M)", unit_price_cents: 2990, tangible: true },
  "churrasco:g": { title: "Churrasco (G)", unit_price_cents: 3490, tangible: true },

  "feijoada:p": { title: "Feijoada (P)", unit_price_cents: 2390, tangible: true },
  "feijoada:m": { title: "Feijoada (M)", unit_price_cents: 2990, tangible: true },
  "feijoada:g": { title: "Feijoada (G)", unit_price_cents: 3490, tangible: true },

  "frango_parmegiana:p": { title: "Frango à Parmegiana (P)", unit_price_cents: 2190, tangible: true },
  "frango_parmegiana:m": { title: "Frango à Parmegiana (M)", unit_price_cents: 2690, tangible: true },
  "frango_parmegiana:g": { title: "Frango à Parmegiana (G)", unit_price_cents: 3190, tangible: true },

  "frango_grelhado:p": { title: "Frango Grelhado (P)", unit_price_cents: 1790, tangible: true },
  "frango_grelhado:m": { title: "Frango Grelhado (M)", unit_price_cents: 2290, tangible: true },
  "frango_grelhado:g": { title: "Frango Grelhado (G)", unit_price_cents: 2790, tangible: true },

  "tilapia:p": { title: "Tilápia (P)", unit_price_cents: 2390, tangible: true },
  "tilapia:m": { title: "Tilápia (M)", unit_price_cents: 2890, tangible: true },
  "tilapia:g": { title: "Tilápia (G)", unit_price_cents: 3390, tangible: true },

  "estrogonofe_carne:p": { title: "Estrogonofe de Carne (P)", unit_price_cents: 2290, tangible: true },
  "estrogonofe_carne:m": { title: "Estrogonofe de Carne (M)", unit_price_cents: 2790, tangible: true },
  "estrogonofe_carne:g": { title: "Estrogonofe de Carne (G)", unit_price_cents: 3290, tangible: true },

  "estrogonofe_frango:p": { title: "Estrogonofe de Frango (P)", unit_price_cents: 2090, tangible: true },
  "estrogonofe_frango:m": { title: "Estrogonofe de Frango (M)", unit_price_cents: 2590, tangible: true },
  "estrogonofe_frango:g": { title: "Estrogonofe de Frango (G)", unit_price_cents: 3090, tangible: true },

  // ESPECIAIS
  "lasanha_carne_frango:unico": { title: "Lasanha de Carne e Frango (Único)", unit_price_cents: 2490, tangible: true },

  "macarrao_bolonhesa:p": { title: "Macarrão à Bolonhesa (P)", unit_price_cents: 1890, tangible: true },
  "macarrao_bolonhesa:m": { title: "Macarrão à Bolonhesa (M)", unit_price_cents: 2390, tangible: true },
  "macarrao_bolonhesa:g": { title: "Macarrão à Bolonhesa (G)", unit_price_cents: 2890, tangible: true },

  // VEGANAS
  "nuggets_veganos:p": { title: "Nuggets Veganos (P)", unit_price_cents: 2090, tangible: true },
  "nuggets_veganos:m": { title: "Nuggets Veganos (M)", unit_price_cents: 2590, tangible: true },
  "nuggets_veganos:g": { title: "Nuggets Veganos (G)", unit_price_cents: 3090, tangible: true },

  "moqueca_palmito:p": { title: "Moqueca de Palmito Pupunha (P)", unit_price_cents: 2290, tangible: true },
  "moqueca_palmito:m": { title: "Moqueca de Palmito Pupunha (M)", unit_price_cents: 2790, tangible: true },
  "moqueca_palmito:g": { title: "Moqueca de Palmito Pupunha (G)", unit_price_cents: 3290, tangible: true },

  "estrogonofe_vegano:p": { title: "Estrogonofe Vegano (P)", unit_price_cents: 2190, tangible: true },
  "estrogonofe_vegano:m": { title: "Estrogonofe Vegano (M)", unit_price_cents: 2690, tangible: true },
  "estrogonofe_vegano:g": { title: "Estrogonofe Vegano (G)", unit_price_cents: 3190, tangible: true },

  "quibe_vegano:p": { title: "Quibe Vegano (P)", unit_price_cents: 1990, tangible: true },
  "quibe_vegano:m": { title: "Quibe Vegano (M)", unit_price_cents: 2490, tangible: true },
  "quibe_vegano:g": { title: "Quibe Vegano (G)", unit_price_cents: 2990, tangible: true },

// BEBIDAS — LATA 350ml
"refri_lata:coca":        { title: "Coca-Cola Lata 350ml", unit_price_cents: 450, tangible: true },
"refri_lata:coca_zero":   { title: "Coca-Cola Zero Lata 350ml", unit_price_cents: 450, tangible: true },
"refri_lata:fanta_uva":   { title: "Fanta Uva Lata 350ml", unit_price_cents: 400, tangible: true },
"refri_lata:fanta_laranja": { title: "Fanta Laranja Lata 350ml", unit_price_cents: 400, tangible: true },
"refri_lata:sprite":      { title: "Sprite Lata 350ml", unit_price_cents: 450, tangible: true },

// BEBIDAS — MAIOR (1L / 2L)
"refri_maior:coca_1l":    { title: "Coca-Cola 1L", unit_price_cents: 790, tangible: true },
"refri_maior:guarana_1l": { title: "Guaraná Antarctica 1L", unit_price_cents: 690, tangible: true },
"refri_maior:fanta_1l":   { title: "Fanta Laranja 1L", unit_price_cents: 690, tangible: true },

"refri_maior:coca_2l":    { title: "Coca-Cola 2L", unit_price_cents: 1290, tangible: true },
"refri_maior:guarana_2l": { title: "Guaraná Antarctica 2L", unit_price_cents: 990, tangible: true },
"refri_maior:fanta_2l":   { title: "Fanta Laranja 2L", unit_price_cents: 1090, tangible: true },
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
          postback_url: `${process.env.PUBLIC_BASE_URL}/webhook/anubispay`,
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

    // ✅ Lê como texto primeiro (evita crash se vier vazio ou não-JSON)
const rawText = await response.text();

let data = null;
try {
  data = rawText ? JSON.parse(rawText) : null;
} catch (e) {
  data = null;
}

console.log("STATUS ANUBIS:", response.status);
console.log("ANUBIS content-type:", response.headers.get("content-type"));
console.log("ANUBIS raw body:", rawText);

// ✅ Se não for OK, devolve erro com detalhes (não dá 500 sem explicação)
if (!response.ok) {
  return res.status(400).json({
    erro: "Falha ao criar transação na AnubisPay",
    status: response.status,
    raw: rawText,
    data,
  });
}

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

// ✅ SALVAR META DO PEDIDO (endereço, itens, etc)
app.post("/pedido/:id/meta", (req, res) => {
  const pedidoId = req.params.id;
  const meta = req.body;

  db.run(
    "UPDATE pedidos SET meta_json = ? WHERE id = ?",
    [JSON.stringify(meta), pedidoId],
    function (err) {
      if (err) {
        console.error("Erro ao salvar meta do pedido:", err);
        return res.status(500).json({ erro: "Erro ao salvar meta do pedido" });
      }

      return res.json({ ok: true });
    }
  );
});

// ✅ LER META DO PEDIDO
app.get("/pedido/:id/meta", (req, res) => {
  const pedidoId = req.params.id;

  db.get(
    "SELECT meta_json FROM pedidos WHERE id = ?",
    [pedidoId],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar meta do pedido:", err);
        return res.status(500).json({ erro: "Erro ao buscar meta do pedido" });
      }

      if (!row || !row.meta_json) {
        return res.status(404).json({ erro: "Meta do pedido não encontrada" });
      }

      try {
        return res.json(JSON.parse(row.meta_json));
      } catch (e) {
        return res.status(500).json({ erro: "Meta corrompida" });
      }
    }
  );
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

app.post("/ajuda", async (req, res) => {
  try {
    const { pergunta } = req.body;

    if (!pergunta) {
      return res.status(400).json({ error: "Pergunta não informada" });
    }

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content: `
Você é um atendente virtual da marmitaria Divino Sabor.
Responda de forma curta, educada e simples.
Se não souber algo, diga para o cliente entrar em contato.
`
          },
          {
            role: "user",
            content: pergunta
          }
        ],
      }),
    });

    const data = await response.json();

    const resposta =
      data?.choices?.[0]?.message?.content ||
      "Desculpe, não consegui responder agora.";

    return res.json({ resposta });
  } catch (err) {
    console.error("Erro no bot de ajuda:", err);
    return res.status(500).json({
      error: "Erro ao processar a pergunta",
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});