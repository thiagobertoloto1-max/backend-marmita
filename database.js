const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

const db = new sqlite3.Database("./data/database_v3.db");

db.serialize(() => {
  // Cria tabela base (se não existir)
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

  // Migração: adiciona colunas faltantes sem quebrar nada
  db.all("PRAGMA table_info(pedidos)", (err, rows) => {
    if (err) {
      console.error("Erro PRAGMA table_info(pedidos):", err);
      return;
    }

    const cols = rows.map((r) => r.name);

    const addColumnIfMissing = (name, type) => {
      if (cols.includes(name)) return;

      db.run(`ALTER TABLE pedidos ADD COLUMN ${name} ${type}`, (e) => {
        if (e) console.error(`Erro ao adicionar coluna ${name}:`, e);
        else console.log(`Coluna adicionada: ${name} (${type})`);
      });
    };

    // ✅ aqui é o que importa pra você agora
    addColumnIfMissing("meta_json", "TEXT");
  });
});

module.exports = db;