// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const Task = require("../models/tasks");
const User = require("../models/users");

// Criar uma nova tarefa
router.post("/", (req, res) => {
  const { nome, exp, user_id, vezesCompletadas = 0, atributos = [] } = req.body;

  Task.create(
    { nome, exp, user_id, vezesCompletadas, atributos },
    (err, taskId) => {
      if (err) {
        if (err.message === "Usuário inválido ou não encontrado") {
          return res.status(400).json({ error: err.message });
        }
        return res.status(500).send(err.message);
      }

      // Após criar a task, adiciona o taskId ao array de tasks do usuário
      User.addTaskToUser(user_id, taskId, (err) => {
        if (err) return res.status(500).send(err.message);
        res.status(201).json({
          message: "Tarefa criada com sucesso",
          taskId: taskId,
        });
      });
    }
  );
});

// Obter todas as tarefas
router.get("/", (req, res) => {
  Task.findAll((err, tasks) => {
    if (err) return res.status(500).send(err.message);
    res.json(tasks);
  });
});

// Obter todas as tarefas de um usuário
router.get("/user/:userId", (req, res) => {
  Task.findByUserId(req.params.userId, (err, tasks) => {
    if (err) return res.status(500).send(err.message);
    res.json(tasks);
  });
});

router.get("/:id", (req, res) => {
  Task.findById(req.params.id, (err, task) => {
    if (err) return res.status(500).send(err.message);
    if (!task) return res.status(404).send("Tarefa não encontrada");
    res.json(task);
  });
});


// Atualizar uma tarefa parcialmente (PATCH)
router.patch("/:id", (req, res) => {
  Task.update(req.params.id, req.body, (err, changes) => {
    if (err) return res.status(500).send(err.message);
    if (changes === 0) return res.status(404).send("Tarefa não encontrada");
    res.status(200).json({ message: "Tarefa atualizada com sucesso" });
  });
});

// Deletar uma tarefa
router.delete("/:id", (req, res) => {
  Task.delete(req.params.id, (err, changes) => {
    if (err) return res.status(500).send(err.message);
    if (changes === 0) return res.status(404).send("Tarefa não encontrada");
    res.sendStatus(204);
  });
});

module.exports = router;
