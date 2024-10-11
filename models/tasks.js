// models/task.js
const db = require("../db/database");

class Task {
  static create(
    { nome, exp, user_id, vezesCompletadas = 0, atributos = [] },
    callback
  ) {
    if (!nome || typeof nome !== "string" || nome.trim() === "") {
      return callback(
        new Error("O campo 'nome' é obrigatório e deve ser uma string.")
      );
    }

    if (!exp || typeof exp !== "number" || exp <= 0) {
      return callback(
        new Error("O campo 'exp' é obrigatório e deve ser um número positivo.")
      );
    }

    if (
      typeof vezesCompletadas !== "number" ||
      vezesCompletadas < 0 ||
      !Number.isInteger(vezesCompletadas)
    ) {
      return callback(
        new Error("'vezesCompletadas' deve ser um número inteiro não negativo.")
      );
    }

    if (
      !Array.isArray(atributos) ||
      !atributos.every((a) => typeof a === "number")
    ) {
      return callback(new Error("'atributos' deve ser um array de números."));
    }

    // Verifica se o usuário existe antes de criar a task
    const checkUserQuery = `SELECT id FROM users WHERE id = ?`;

    db.get(checkUserQuery, [user_id], (err, user) => {
      if (err) {
        return callback(new Error("Erro ao verificar o usuário"));
      }

      if (!user) {
        return callback(new Error("Usuário inválido ou não encontrado"));
      }

      // Se o usuário existir, prossegue com a criação da task
      const insertTaskQuery = `
        INSERT INTO tasks (nome, exp, vezesCompletadas, atributos, user_id)
        VALUES (?, ?, ?, ?, ?)
      `;

      // Converte o array de 'atributos' para string
      const atributosString = atributos.join(",");

      db.run(
        insertTaskQuery,
        [nome, exp, vezesCompletadas, atributosString, user_id],
        function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, this.lastID);
        }
      );
    });
  }

  static findById(id, callback) {
    const query = `SELECT * FROM tasks WHERE id = ?`;

    db.get(query, [id], (err, task) => {
      if (!task) {
        return callback(new Error("Tarefa não encontrada"));
      }

      // Busca os atributos associados a essa tarefa
      const atributosQuery = `SELECT * FROM atributos WHERE id IN (${task.atributos})`;

      db.all(atributosQuery, [], (err, atributos) => {
        if (err) {
          return callback(err);
        }
        // Retorna a tarefa com os atributos
        task.atributos = atributos;
        callback(null, task);
      });
    });
  }

  static update(id, updates, callback) {
    const fields = [];
    const values = [];

    // Validação de campos durante a atualização
    if (
      updates.nome &&
      (typeof updates.nome !== "string" || updates.nome.trim() === "")
    ) {
      return callback(
        new Error("O campo 'nome' deve ser uma string não vazia.")
      );
    }

    if (
      updates.exp !== undefined &&
      (typeof updates.exp !== "number" || updates.exp <= 0)
    ) {
      return callback(new Error("O campo 'exp' deve ser um número positivo."));
    }

    if (
      updates.vezesCompletadas !== undefined &&
      (typeof updates.vezesCompletadas !== "number" ||
        updates.vezesCompletadas < 0 ||
        !Number.isInteger(updates.vezesCompletadas))
    ) {
      return callback(
        new Error("'vezesCompletadas' deve ser um número inteiro não negativo.")
      );
    }

    if (
      updates.atributos !== undefined &&
      (!Array.isArray(updates.atributos) ||
        !updates.atributos.every((a) => typeof a === "number"))
    ) {
      return callback(new Error("'atributos' deve ser um array de números."));
    }

    // Construir dinamicamente a query de atualização com base nos campos fornecidos
    for (const key in updates) {
      if (key === "atributos") {
        fields.push(`${key} = ?`);
        values.push(updates[key].join(",")); // Converte array de atributos para string
      } else {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    // Adiciona o ID ao final dos valores
    values.push(id);

    const query = `
      UPDATE tasks
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    db.run(query, values, function (err) {
      if (err) {
        return callback(err);
      }
      if (this.changes === 0) {
        return callback(new Error("Tarefa não encontrada para atualizar."));
      }
      callback(null, this.changes);
    });
  }

  static delete(id, callback) {
    // Verificar se a task existe antes de deletar
    db.run(`DELETE FROM tasks WHERE id = ?`, [id], function (err) {
      if (err) {
        return callback(err);
      }
      if (this.changes === 0) {
        return callback(new Error("Tarefa não encontrada para deletar."));
      }
      callback(null, this.changes);
    });
  }

  static findAll(callback) {
    const query = `SELECT * FROM tasks`;

    db.all(query, [], (err, tasks) => {
      if (err) {
        return callback(err);
      }

      // Para cada tarefa, buscamos os atributos vinculados
      const tasksWithAtributos = tasks.map((task) => {
        return new Promise((resolve, reject) => {
          const atributosQuery = `SELECT * FROM atributos WHERE id IN (${task.atributos})`;

          db.all(atributosQuery, [], (err, atributos) => {
            if (err) {
              reject(err);
            } else {
              task.atributos = atributos;
              resolve(task);
            }
          });
        });
      });

      // Aguarda todas as tarefas com seus atributos
      Promise.all(tasksWithAtributos)
        .then((tasks) => callback(null, tasks))
        .catch((err) => callback(err));
    });
  }

  static findByUserId(user_id, callback) {
    // Verificar se o usuário existe
    const checkUserQuery = `SELECT id FROM users WHERE id = ?`;

    db.get(checkUserQuery, [user_id], (err, user) => {
      if (err) {
        return callback(new Error("Erro ao verificar o usuário"));
      }

      if (!user) {
        // Retorna um erro se o usuário não for encontrado
        return callback(new Error("Usuário inválido ou não encontrado"));
      }

      // Buscar as tasks associadas ao usuário
      db.all(
        `SELECT * FROM tasks WHERE user_id = ?`,
        [user_id],
        (err, rows) => {
          if (err) {
            return callback(err);
          }
          callback(null, rows);
        }
      );
    });
  }
}

module.exports = Task;
