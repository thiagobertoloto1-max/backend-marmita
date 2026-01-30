const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

// Garante que a pasta ./data existe (IMPORTANTE no Render)
if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

// Banco NOVO (força schema correto)
const db = new sqlite3.Database("./data/database_v3.db");

db.serialize(() => {
  // Cria tabela já com TODAS as colunas corretas
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      telefone TEXT,
      valor REAL,
      status TEXT,
      transacao_id TEXT,
      items TEXT,
      total_cents INTEGER
    )
  `);
});

module.exports = db;