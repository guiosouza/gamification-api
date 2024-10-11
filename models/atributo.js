// models/atributo.js
const db = require("../db/database");

class Atributo {
  static create({ nome, nivel, exp }, callback) {
    if (!nome || typeof nome !== "string" || nome.trim() === "") {
      return callback(
        new Error("O campo 'nome' é obrigatório e deve ser uma string.")
      );
    }

    if (!nivel || typeof nivel !== "number" || nivel <= 0) {
      return callback(
        new Error(
          "O campo 'nivel' é obrigatório e deve ser um número positivo."
        )
      );
    }

    if (!exp || typeof exp !== "number" || exp <= 0) {
      return callback(
        new Error("O campo 'exp' é obrigatório e deve ser um número positivo.")
      );
    }

    const query = `
          INSERT INTO atributos (nome, nivel, exp)
          VALUES (?, ?, ?)
        `;

    db.run(query, [nome, nivel, exp], function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.lastID);
    });
  }

  static findById(id, callback) {
    db.get(`SELECT * FROM atributos WHERE id = ?`, [id], (err, row) => {
      if (!row) {
        return callback(new Error("Atributo não encontrado"));
      }
      callback(err, row);
    });
  }

  static update(id, updates, callback) {
    const fields = [];
    const values = [];

    if (
      updates.nome &&
      (typeof updates.nome !== "string" || updates.nome.trim() === "")
    ) {
      return callback(
        new Error("O campo 'nome' deve ser uma string não vazia.")
      );
    }

    if (
      updates.nivel !== undefined &&
      (typeof updates.nivel !== "number" || updates.nivel <= 0)
    ) {
      return callback(
        new Error("O campo 'nivel' deve ser um número positivo.")
      );
    }

    if (
      updates.exp !== undefined &&
      (typeof updates.exp !== "number" || updates.exp <= 0)
    ) {
      return callback(new Error("O campo 'exp' deve ser um número positivo."));
    }

    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }

    values.push(id);

    const query = `UPDATE atributos SET ${fields.join(", ")} WHERE id = ?`;

    db.run(query, values, function (err) {
      if (err) {
        return callback(err);
      }
      if (this.changes === 0) {
        return callback(new Error("Atributo não encontrado para atualizar."));
      }
      callback(null, this.changes);
    });
  }

  static delete(id, callback) {
    const query = `DELETE FROM atributos WHERE id = ?`;

    db.run(query, [id], function (err) {
      if (err) {
        return callback(err);
      }
      if (this.changes === 0) {
        return callback(new Error("Atributo não encontrado."));
      }
      callback(null, this.changes);
    });
  }

  static findAll(callback) {
    const query = `SELECT * FROM atributos`;

    db.all(query, [], (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    });
  }
}

module.exports = Atributo;
