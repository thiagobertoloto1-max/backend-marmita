require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const crypto = require("crypto");
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
  "http://localhost:8081",
  "http://localhost:8081",
];

const corsOptions = {
  origin: function (origin, callback) {
    // permite requests sem origin (ex: curl, postman)
    if (!origin) return callback(null, true);
const corsOptions = {
  origin: function (origin, callback) {
    // permite requests sem origin (ex: curl, postman)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use(cors(corsOptions));
app.options(/.*/, cors());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


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

function buildOrderFromItems(items) {
  let total_cents = 0;
  const payloadItems = [];

  for (const it of items) {
    const sku = it?.sku;
    const qty = Number(it?.qty);

    if (!sku || !Number.isFinite(qty) || qty < 1) {
      const err = new Error("Item inválido. Use { sku, qty>=1 }");
      err.statusCode = 400;
      throw err;
    }

    const produto = CATALOGO[sku];
    if (!produto) {
      const err = new Error(`SKU inválido: ${sku}`);
      err.statusCode = 400;
      throw err;
    }

    total_cents += produto.unit_price_cents * qty;
    payloadItems.push({
      title: produto.title,
      unit_price: produto.unit_price_cents,
      quantity: qty,
      tangible: produto.tangible,
    });
  }

  return { total_cents, payloadItems };
}

async function createPixPayment(items, customer) {
  const bearerToken = process.env.AXENPAY_BEARER_TOKEN;
  const AXENPAY_BASE_URL = process.env.AXENPAY_BASE_URL;
  const publicBaseUrl = process.env.PUBLIC_BASE_URL;

  if (!bearerToken) {
    const err = new Error("AxenPay bearer token not configured");
    err.statusCode = 500;
    throw err;
  }
  if (!AXENPAY_BASE_URL) {
    const err = new Error("AxenPay base URL not configured");
    err.statusCode = 500;
    throw err;
  }
  if (!publicBaseUrl) {
    const err = new Error("Public base URL not configured");
    err.statusCode = 500;
    throw err;
  }

  const { total_cents, payloadItems } = buildOrderFromItems(items);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = `${AXENPAY_BASE_URL}/api/payments/deposit`;
    const externalId = crypto.randomUUID
      ? `pedido_${crypto.randomUUID()}`
      : `pedido_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: Number((total_cents / 100).toFixed(2)),
        external_id: externalId,
        clientCallbackUrl: `${publicBaseUrl}/webhook/axenpay`,
        payer: {
          name: customer.nome,
          email: customer.email || "cliente@teste.com",
          document: customer.cpfDigits,
        },
      }),
      signal: controller.signal,
    });

    const rawText = await response.text();
    let data = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      console.error("AXENPAY STATUS:", response.status);
      console.error("AXENPAY BODY:", rawText);
      const err = new Error(`AXENPAY ERROR ${response.status}`);
      err.statusCode = response.status;
      err.rawBody = rawText;
      err.alreadyLogged = true;
      throw err;
    }

    const transactionId =
      data?.data?.id || data?.id || data?.transaction_id || data?.payment_id;
    const pix = data?.data?.pix || data?.pix || data?.payment || {};
    const qrCode =
      pix.qr_code ||
      pix.qrCode ||
      pix.qr_code_base64 ||
      pix.qr_code_image ||
      data?.qr_code ||
      data?.qrCode;
    const copyPasteCode =
      pix.copy_paste_code ||
      pix.copyPasteCode ||
      pix.emv ||
      pix.br_code ||
      pix.qr_code_text ||
      data?.emv ||
      data?.br_code;
    const status = data?.data?.status || data?.status || pix.status;

    if (!transactionId || !qrCode || !copyPasteCode) {
      const err = new Error("AXENPAY ERROR 502");
      err.statusCode = 502;
      err.rawBody = rawText;
      throw err;
    }

    return {
      ok: true,
      data: {
        qr_code: qrCode,
        copy_paste_code: copyPasteCode,
        transaction_id: transactionId,
        status: status || "PENDING",
      },
    };
  } catch (error) {
    const status = error?.statusCode || 500;
    const body = error?.rawBody || error?.message || "UNKNOWN_ERROR";
    if (!error?.alreadyLogged) {
      console.error("AXENPAY STATUS:", status);
      console.error("AXENPAY BODY:", body);
    }
    return {
      ok: false,
      error: {
        message: error?.message || "AXENPAY ERROR",
        status,
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// --- COLOQUE A ROTA DE PING AQUI, DO LADO DE FORA ---
// Rota de "Health Check" para o Render não dormir
app.get('/ping', (req, res) => {
  console.log('Ping recebido! Servidor continua acordado.');
  res.status(200).json({ status: 'ativo', message: 'Servidor rodando liso!' });
});


function buildOrderFromItems(items) {
  let total_cents = 0;
  const payloadItems = [];

  for (const it of items) {
    const sku = it?.sku;
    const qty = Number(it?.qty);

    if (!sku || !Number.isFinite(qty) || qty < 1) {
      const err = new Error("Item inválido. Use { sku, qty>=1 }");
      err.statusCode = 400;
      throw err;
    }

    const produto = CATALOGO[sku];
    if (!produto) {
      const err = new Error(`SKU inválido: ${sku}`);
      err.statusCode = 400;
      throw err;
    }

    total_cents += produto.unit_price_cents * qty;
    payloadItems.push({
      title: produto.title,
      unit_price: produto.unit_price_cents,
      quantity: qty,
      tangible: produto.tangible,
    });
  }

  return { total_cents, payloadItems };
}

let AXENPAY_TOKEN_CACHE = {
  token: null,
  expiresAt: 0,
};

async function getAxenpayToken() {
  const base = process.env.AXENPAY_BASE_URL;
  const clientId = process.env.AXENPAY_CLIENT_ID;
  const clientSecret = process.env.AXENPAY_CLIENT_SECRET;

  if (!base || !clientId || !clientSecret) {
    const err = new Error("AxenPay: BASE_URL / CLIENT_ID / CLIENT_SECRET não configurados");
    err.statusCode = 500;
    throw err;
  }

  const now = Date.now();
  if (AXENPAY_TOKEN_CACHE.token && AXENPAY_TOKEN_CACHE.expiresAt > now + 30_000) {
    return AXENPAY_TOKEN_CACHE.token;
  }

  const resp = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const raw = await resp.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }

  if (!resp.ok) {
    const err = new Error(`AxenPay login falhou (${resp.status})`);
    err.statusCode = resp.status;
    err.rawBody = raw;
    throw err;
  }

  const token = data?.token;
  if (!token) {
    const err = new Error("AxenPay login: campo 'token' não veio na resposta");
    err.statusCode = 502;
    err.rawBody = raw;
    throw err;
  }

  // Cache simples (55 min). Ajuste depois se quiser usar exp do JWT.
  AXENPAY_TOKEN_CACHE.token = token;
  AXENPAY_TOKEN_CACHE.expiresAt = Date.now() + 55 * 60 * 1000;

  return token;
}

async function createPixPayment(items, customer) {
  // DEBUG flag to toggle between safe test payload and production payload
  const DEBUG_AXENPAY = false;
  
  const bearerToken = await getAxenpayToken();
  const AXENPAY_BASE_URL = process.env.AXENPAY_BASE_URL;
  const publicBaseUrl = process.env.PUBLIC_BASE_URL;
  if (!AXENPAY_BASE_URL) {
    const err = new Error("AxenPay base URL not configured");
    err.statusCode = 500;
    throw err;
  }
  if (!publicBaseUrl) {
    const err = new Error("Public base URL not configured");
    err.statusCode = 500;
    throw err;
  }

  const { total_cents, payloadItems } = buildOrderFromItems(items);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = `${AXENPAY_BASE_URL}/api/payments/deposit`;
    const externalId = crypto.randomUUID
      ? `pedido_${crypto.randomUUID()}`
      : `pedido_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
      
    const cpfDigits = String(customer.cpfDigits || customer.cpf || "")
      .replace(/\D/g, "");

    const payerEmail = customer.email || "sem_email@divinosabor.shop";

    // URL PÚBLICA SEGURA (Evita erro 500 na AxenPay)
    let callbackUrl = `${publicBaseUrl}/webhook/axenpay`;
    
    if (callbackUrl.includes("localhost") || callbackUrl.includes("127.0.0.1")) {
      console.warn("⚠️ AVISO: URL de Callback é Localhost. Substituindo por URL segura para evitar erro 500.");
      callbackUrl = "https://divinosabor.shop/webhook/axenpay"; 
    }
      
    const payload = DEBUG_AXENPAY
      ? {
          amount: 5.0,
          external_id: "teste_postman_001",
          clientCallbackUrl: "https://google.com",
          payer: {
            name: "Teste De Pagamento",
            email: "teste@exemplo.com.br",
            document: "48714499800",
          },
        }
      : {
          amount: Number((total_cents / 100).toFixed(2)),
          external_id: externalId,
          clientCallbackUrl: callbackUrl,
          payer: {
            name: customer.nome,
            email: payerEmail, 
            document: cpfDigits,
          },
        };

    console.log("=================================");
    console.log("AXENPAY DEPOSIT URL:", url);
    console.log("AXENPAY DEPOSIT PAYLOAD:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("=================================");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const rawText = await response.text();
    
    if (!response.ok) {
      console.error("=================================");
      console.error("AXENPAY STATUS:", response.status);
      console.error("AXENPAY RESPONSE BODY:", rawText);
      console.error("=================================");

      const err = new Error("Erro ao criar pagamento AxenPay");
      err.statusCode = response.status;
      err.rawBody = rawText;
      err.alreadyLogged = true;
      throw err;
    }

    let data = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
      data = null;
    }

    console.log("AXENPAY BODY (PARSED):", JSON.stringify(data, null, 2));

    // ✅ CORREÇÃO AQUI: LER O FORMATO REAL RETORNADO PELA AXENPAY
    // O payload de sucesso vem dentro de "qrCodeResponse"
    const qrResponse = data?.qrCodeResponse || {};

    const transactionId =
      qrResponse.transactionId || 
      data?.data?.id || 
      data?.id || 
      data?.transaction_id || 
      data?.payment_id;

    // A string "000201..." é o BR Code (Copia e Cola). 
    // A AxenPay está enviando isso no campo "qrcode".
    const rawQrString = qrResponse.qrcode || "";

    const copyPasteCode =
      rawQrString || 
      data?.data?.pix?.copy_paste_code ||
      data?.pix?.copyPasteCode ||
      data?.emv ||
      data?.br_code;

    // Como não veio imagem Base64, usamos a string Copia e Cola como "qr_code" também.
    // O frontend (se usar biblioteca de QR) vai gerar a imagem a partir desse texto.
    const qrCode =
      rawQrString || 
      data?.data?.pix?.qr_code ||
      data?.qr_code_base64;

    const finalQrCode = qrCode || copyPasteCode;

    if (!transactionId || !finalQrCode || !copyPasteCode) {
      const err = new Error("AXENPAY ERROR: Resposta incompleta (campos não encontrados)");
      err.statusCode = 502;
      err.rawBody = rawText;
      throw err;
    }

    return {
      ok: true,
      data: {
        qr_code: finalQrCode,
        copy_paste_code: copyPasteCode,
        transaction_id: transactionId,
        status: qrResponse.status || data?.data?.status || "PENDING",
      },
    };
  } catch (error) {
    const status = error?.statusCode || 500;
    const body = error?.rawBody || error?.message || "UNKNOWN_ERROR";
    if (!error?.alreadyLogged) {
      console.error("AXENPAY STATUS:", status);
      console.error("AXENPAY BODY:", body);
    }
    return {
      ok: false,
      error: {
        message: error?.message || "AXENPAY ERROR",
        status,
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/* Criar pagamento PIX (DEBUG REFORÇADO) */
app.post("/create-payment", async (req, res) => {
  console.log("\n=== 🟢 INÍCIO REQUEST /create-payment ===");
  
  console.log("HEADERS (Content-Type):", req.headers["content-type"]);
  console.log("BODY RECEBIDO:", JSON.stringify(req.body, null, 2));

  const { nome, telefone, cpf, items, email } = req.body;

  // Validação Granular
  const erros = [];
  if (!nome) erros.push("nome ausente/vazio");
  if (!telefone) erros.push("telefone ausente/vazio");
  if (!cpf) erros.push("cpf ausente/vazio");
  if (!Array.isArray(items)) erros.push("items não é array");
  else if (items.length === 0) erros.push("items está vazio");

  if (erros.length > 0) {
    console.error("❌ REJEITADO PELO BACKEND:", erros.join(", "));
    return res.status(400).json({
      erro: "Dados incompletos ou inválidos.",
      detalhes: erros 
    });
  }

  // Sanitização
  const nomeLimpo = String(nome).trim();
  const cpfDigits = onlyDigits(cpf);
  const phoneDigits = String(telefone || "").replace(/\D/g, "");

  // Se vier com 55 na frente (tipo 551299...), remove para padronizar
  const normalizedPhone =
    phoneDigits.length === 13 && phoneDigits.startsWith("55")
      ? phoneDigits.slice(2)
      : phoneDigits;

  console.log(`DADOS PROCESSADOS -> CPF: ${cpfDigits}, Tel: ${normalizedPhone}, Itens: ${items.length}, Email: ${email}`);

  if (nomeLimpo.length < 2) return res.status(400).json({ erro: "Nome inválido (muito curto)" });
  if (cpfDigits.length !== 11) return res.status(400).json({ erro: "CPF inválido (precisa ter 11 dígitos)" });
  
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    console.warn("⚠️ ALERTA: Telefone com tamanho incomum:", phoneDigits);
  }

  try {
    const order = buildOrderFromItems(items);
    
    const pixPayment = await createPixPayment(items, {
      nome: nomeLimpo,
      phone: phoneDigits,
      cpfDigits,
      email: email, 
    });

    if (!pixPayment.ok) {
      console.error("❌ ERRO NA FUNÇÃO createPixPayment:", pixPayment.error);
      const msg = pixPayment.error.message || "Erro ao criar pagamento";
      return res.status(500).json({ erro: msg });
    }

    console.log("✅ SUCESSO AXENPAY. Transaction ID:", pixPayment.data.transaction_id);

    // Salva no SQLite
/* Criar pagamento PIX (ANTI-FRAUDE: total calculado no backend) */
app.post("/create-payment", async (req, res) => {
  const { nome, telefone, cpf, items } = req.body;

  // Validação básica
  if (!nome || !telefone || !cpf || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      erro: "Dados incompletos. Envie: nome, telefone, cpf e items[]",
    });
  }

  const nomeLimpo = String(nome).trim();
  const cpfDigits = onlyDigits(cpf);
  const phoneDigits = onlyDigits(telefone);

  if (nomeLimpo.length < 2) {
    return res.status(400).json({ erro: "Nome inválido" });
  }

  if (cpfDigits.length !== 11) {
    return res.status(400).json({ erro: "CPF inválido (precisa ter 11 dígitos)" });
  }

  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return res.status(400).json({ erro: "Telefone inválido" });
  }

  try {
    const order = buildOrderFromItems(items);
    const pixPayment = await createPixPayment(items, {
      nome: nomeLimpo,
      phone: phoneDigits,
      cpfDigits,
    });
    
    if (!pixPayment.ok) {
      return res.status(400).json({ erro: "Erro ao criar pagamento" });
    }

    // Salva no SQLite (inclui items e total_cents)
    db.run(
      "INSERT INTO pedidos (nome, telefone, valor, status, transacao_id, items, total_cents) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nomeLimpo,
        phoneDigits,
        order.total_cents / 100,
        nomeLimpo,
        phoneDigits,
        order.total_cents / 100, // valor em reais (só pra exibir)
        "AGUARDANDO",
        pixPayment.data.transaction_id,
        pixPayment.data.transaction_id,
        JSON.stringify(items),
        order.total_cents,
        order.total_cents,
      ],
      function (err) {
        if (err) {
          console.error("❌ ERRO AO SALVAR NO DB:", err);
          return res.status(500).json({ erro: "Erro ao salvar pedido no banco" });
          console.error("PAYMENT CREATION FAILED:", err);
          return res.status(500).json({ erro: "Erro ao salvar pedido" });
        }

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        return res.json({
          pedido_id: this.lastID,
          transacao_id: String(pixPayment.data.transaction_id),
          total_cents: order.total_cents,
          total_reais: (order.total_cents / 100).toFixed(2),
          pix: {
            qr_code: String(pixPayment.data.qr_code),
            url: null,
            expiration_date: expiresAt,
            e2_e: String(pixPayment.data.transaction_id),
            copy_paste_code: String(pixPayment.data.copy_paste_code),
          },
          transacao_id: pixPayment.data.transaction_id,
          pix: {
            qr_code: pixPayment.data.qr_code,
            copy_paste_code: pixPayment.data.copy_paste_code,
          },
        });
      }
    );
  } catch (error) {
    console.error("❌ EXCEPTION NO ROUTE HANDLER:", error);
    const statusCode = error?.statusCode || 500;
    const errorMessage = statusCode === 400 ? error.message : "Erro interno ao processar pagamento";
    return res.status(statusCode).json({ erro: errorMessage });
  }
});

// --- SUBSTITUA O APP.POST INTEIRO POR ESTE ---
app.post("/webhook/axenpay", (req, res) => {
  try {
    console.log("WEBHOOK RECEBIDO:", req.body);
/* Webhook (AxenPay chama quando muda status) */
app.post("/webhook/axenpay", (req, res) => {
  try {
    console.log("WEBHOOK RECEBIDO:", req.body);

    const body = req.body || {};
    
    // 1. Identifica o ID
    const transacaoId =
      body.id || body.Id || body.transaction_id || body.transactionId || body.txid || body?.data?.id;

    // 2. Identifica o Status
    const rawStatus = body.status || body.Status || body?.data?.status;
    const status = String(rawStatus || "").toUpperCase();

    // 3. Identifica o Valor
    const rawAmount = body.Amount || body.amount || body?.data?.amount || 0;
    const valor = Number(rawAmount);

    const paidStatuses = new Set(["PAID", "COMPLETED", "CONFIRMED", "SUCCESS"]);
    
    // LOGICA 1: Atualizar Banco de Dados (SÓ SE PAGOU)
    if (paidStatuses.has(status) && transacaoId) {
      db.run(
        "UPDATE pedidos SET status = 'PAGO' WHERE transacao_id = ?",
        [transacaoId],
        (err) => {
           if (!err) console.log("DB Atualizado para PAGO:", transacaoId);
        }
      );
    }

    // LOGICA 2: Avisar no Telegram (SE PAGOU OU SE GEROU)
    // Se for PAGO ou PENDENTE, manda mensagem
    if ((paidStatuses.has(status) || status === 'PENDING') && transacaoId) {
        enviarNotificacaoTelegram(valor, status, transacaoId);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return res.sendStatus(200);
  }
    const body = req.body || {};
    const transacaoId =
      body.id ||
      body.Id ||
      body.transaction_id ||
      body.transactionId ||
      body.txid ||
      body?.data?.id ||
      body?.data?.transaction_id;
    const rawStatus =
      body.status || body.Status || body?.data?.status || body?.event?.status;
    const status = String(rawStatus || "").toUpperCase();

    const paidStatuses = new Set(["PAID", "COMPLETED", "CONFIRMED", "SUCCESS"]);

    if (paidStatuses.has(status) && transacaoId) {
      db.run(
        "UPDATE pedidos SET status = 'PAGO' WHERE transacao_id = ?",
        [transacaoId],
        function (err) {
          if (err) {
            console.error("WEBHOOK ERROR:", err);
          } else {
            console.log("Pedido marcado como PAGO:", transacaoId);
          }
        }
      );
    }

    return res.sendStatus(200);
  try {
    // ... código que estava aqui dentro ...
    return res.sendStatus(200);
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return res.sendStatus(200);
  }
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

/* Buscar pedido pelo ID grandão da AxenPay */
/* Buscar pedido pelo ID grandão da AxenPay */
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

    if (!process.env.MISTRAL_API_KEY) {
      return res.status(503).json({
        error: "Serviço de ajuda indisponível no momento",
      });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return res.status(503).json({
        error: "Serviço de ajuda indisponível no momento",
      });
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

// --- SUBSTITUA A FUNÇÃO ANTIGA POR ESTA NOVA ---
async function enviarNotificacaoTelegram(valor, status, transacaoId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  let valorFinal = valor;
  if (valor > 0 && Number.isInteger(valor)) {
      valorFinal = valor / 100;
  }

  // Define o título e a cor do emoji baseados no status
  let titulo = "⚠️ ATUALIZAÇÃO DE STATUS";
  let emoji = "🔔";

  if (status === 'PENDING' || status === 'CRIADO') {
      titulo = "🆕 PIX GERADO (AGUARDANDO)";
      emoji = "⏳";
  } else if (status === 'PAID' || status === 'APPROVED' || status === 'COMPLETED') {
      titulo = "✅ PAGAMENTO CONFIRMADO!";
      emoji = "💰";
  }

  const mensagem = `
${emoji} *${titulo}*
💵 Valor: R$ ${Number(valorFinal).toFixed(2)}
🆔 ID: ${transacaoId}
ℹ️ Status: ${status}
  `;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: mensagem, parse_mode: 'Markdown' })
    });
    console.log(`🔔 Notificação (${status}) enviada pro Telegram!`);
  } catch (erro) {
    console.error('Erro Telegram:', erro);
  }
}