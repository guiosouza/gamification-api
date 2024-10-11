// models/user.js
const db = require("../db/database");

class User {
  static create({ nome, nivel, exp, patente }, callback) {
    const query = `
      INSERT INTO users (nome, nivel, exp, patente)
      VALUES (?, ?, ?, ?)
    `;
    db.run(query, [nome, nivel, exp, patente], function (err) {
      callback(err, this ? this.lastID : null);
    });
  }

  static findById(id, callback) {
    const query = `
      SELECT users.*, tasks.id AS task_id, tasks.nome AS task_nome, tasks.exp AS task_exp, 
             tasks.vezesCompletadas, tasks.atributos
      FROM users
      LEFT JOIN tasks ON users.id = tasks.user_id
      WHERE users.id = ?
    `;

    db.all(query, [id], (err, rows) => {
      if (err) return callback(err);

      // Verificar se o usuário foi encontrado
      if (rows.length === 0) {
        return callback(null, null); // Retornar null se o usuário não for encontrado
      }

      // Organizar os resultados
      const user = {
        id: rows[0].id,
        nome: rows[0].nome,
        nivel: rows[0].nivel,
        exp: rows[0].exp,
        patente: rows[0].patente,
        tasks: [],
        data_criacao: rows[0].data_criacao,
        data_edicao: rows[0].data_edicao,
      };

      // Adicionar as tarefas ao array, se houver
      rows.forEach((row) => {
        if (row.task_id) {
          user.tasks.push({
            id: row.task_id,
            nome: row.task_nome,
            exp: row.task_exp,
            vezesCompletadas: row.vezesCompletadas,
            atributos: row.atributos ? row.atributos.split(',').map(Number) : [],
          });
        }
      });

      callback(null, user);
    });
  }

  static updatePartial(id, updates, callback) {
    // Construir a query dinamicamente com os campos disponíveis
    const fields = [];
    const values = [];

    if (updates.nome !== undefined) {
      fields.push("nome = ?");
      values.push(updates.nome);
    }

    if (updates.nivel !== undefined) {
      fields.push("nivel = ?");
      values.push(updates.nivel);
    }

    if (updates.exp !== undefined) {
      fields.push("exp = ?");
      values.push(updates.exp);
    }

    if (updates.patente !== undefined) {
      fields.push("patente = ?");
      values.push(updates.patente);
    }

    // Adiciona o campo de data de edição
    fields.push("data_edicao = CURRENT_TIMESTAMP");

    // Finalizando a query
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    db.run(query, values, function (err) {
      callback(err, this.changes);
    });
  }

  static delete(id, callback) {
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
      callback(err, this.changes);
    });
  }

  static findAll(callback) {
    const query = `
      SELECT users.*, tasks.id AS task_id, tasks.nome AS task_nome, tasks.exp AS task_exp, 
             tasks.vezesCompletadas, tasks.atributos
      FROM users
      LEFT JOIN tasks ON users.id = tasks.user_id
    `;

    db.all(query, [], (err, rows) => {
      if (err) return callback(err);

      // Organizar os resultados para ter um array de objetos de tasks dentro de cada usuário
      const users = {};

      rows.forEach((row) => {
        if (!users[row.id]) {
          users[row.id] = {
            id: row.id,
            nome: row.nome,
            nivel: row.nivel,
            exp: row.exp,
            patente: row.patente,
            tasks: [],
            data_criacao: row.data_criacao,
            data_edicao: row.data_edicao,
          };
        }

        // Adicionar tarefa ao array de tasks, se existir
        if (row.task_id) {
          users[row.id].tasks.push({
            id: row.task_id,
            nome: row.task_nome,
            exp: row.task_exp,
            vezesCompletadas: row.vezesCompletadas,
            atributos: row.atributos ? row.atributos.split(',').map(Number) : [],
          });
        }
      });

      // Converter o objeto `users` em um array
      callback(null, Object.values(users));
    });
  }

  static addTaskToUser(userId, taskId, callback) {
    // Primeiro, pegamos o campo tasks atual do usuário
    db.get("SELECT tasks FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) return callback(err);

      let taskIds = row.tasks ? row.tasks.split(",") : [];

      // Adicionar o novo taskId ao array
      taskIds.push(taskId);

      // Converter o array de volta para string
      const updatedTasks = taskIds.join(",");

      // Atualizar o usuário com os novos IDs das tasks
      db.run(
        "UPDATE users SET tasks = ?, data_edicao = CURRENT_TIMESTAMP WHERE id = ?",
        [updatedTasks, userId],
        function (err) {
          callback(err, this.changes);
        }
      );
    });
  }

  static removeTaskFromUser(userId, taskId, callback) {
    db.get("SELECT tasks FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) return callback(err);

      let taskIds = row.tasks ? row.tasks.split(",") : [];

      // Filtrar o array para remover o taskId
      taskIds = taskIds.filter((id) => id !== taskId.toString());

      // Converter o array de volta para string
      const updatedTasks = taskIds.join(",");

      // Atualizar o usuário com a lista de tasks atualizada
      db.run(
        "UPDATE users SET tasks = ?, data_edicao = CURRENT_TIMESTAMP WHERE id = ?",
        [updatedTasks, userId],
        function (err) {
          callback(err, this.changes);
        }
      );
    });
  }
}

module.exports = User;
