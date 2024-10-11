// routes/atributoRoutes.js
const express = require("express");
const router = express.Router();
const Atributo = require("../models/atributo");

// Criar um novo atributo
router.post("/", (req, res) => {
  const { nome, nivel, exp, task_id } = req.body;

  Atributo.create({ nome, nivel, exp, task_id }, (err, atributoId) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).json({ message: "Atributo criado com sucesso", atributoId });
  });
});

router.get("/", (req, res) => {
    Atributo.findAll((err, atributos) => {
      if (err) return res.status(500).send(err.message);
      res.json(atributos);
    });
  });

// Obter um atributo por ID
router.get("/:id", (req, res) => {
  Atributo.findById(req.params.id, (err, atributo) => {
    if (err) return res.status(500).send(err.message);
    if (!atributo) return res.status(404).send("Atributo não encontrado");
    res.json(atributo);
  });
});

// Atualizar um atributo
router.patch("/:id", (req, res) => {
  Atributo.update(req.params.id, req.body, (err, changes) => {
    if (err) return res.status(500).send(err.message);
    if (changes === 0) return res.status(404).send("Atributo não encontrado");
    res.status(200).json({ message: "Atributo atualizado com sucesso" });
  });
});

// Deletar um atributo
router.delete("/:id", (req, res) => {
  Atributo.delete(req.params.id, (err, changes) => {
    if (err) return res.status(500).send(err.message);
    if (changes === 0) return res.status(404).send("Atributo não encontrado");
    res.sendStatus(204);
  });
});

module.exports = router;
