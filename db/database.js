// db/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define o caminho onde o arquivo SQLite será salvo (neste caso, na pasta 'db')
const dbPath = path.resolve(__dirname, "database.sqlite");

// Conecta ao banco de dados, criando o arquivo se não existir
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite");
  }
});

db.serialize(() => {
  // Tabela de Atributos
  db.run(`
    CREATE TABLE IF NOT EXISTS atributos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      nivel INTEGER NOT NULL,
      exp INTEGER NOT NULL,
      data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
      data_edicao TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Trigger para atualizar 'data_edicao' automaticamente
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_data_edicao_atributo
    AFTER UPDATE ON atributos
    FOR EACH ROW
    BEGIN
      UPDATE atributos SET data_edicao = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  // Cria a tabela de Usuário, se ela ainda não existir
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      nivel INTEGER NOT NULL,
      exp INTEGER NOT NULL,
      patente TEXT NOT NULL,
      tasks TEXT DEFAULT '',  -- Campo para armazenar IDs das tasks
      data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
      data_edicao TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_data_edicao
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET data_edicao = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  // Atualiza a tabela de Tarefa, removendo 'nivel' e adicionando 'vezesCompletadas' e 'atributos'
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      exp INTEGER NOT NULL,
      vezesCompletadas INTEGER DEFAULT 0,  -- Número de vezes completadas
      atributos TEXT DEFAULT '',  -- Campo para armazenar um array de IDs como string
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
