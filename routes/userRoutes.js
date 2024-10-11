// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/users');

// Criar um novo usuário
router.post('/', (req, res) => {
  User.create(req.body, (err, userId) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).json({ id: userId });
  });
});

// Obter todos os usuários
router.get('/', (req, res) => {
  User.findAll((err, users) => {
    if (err) return res.status(500).send(err.message);
    res.json(users);
  });
});


// Obter um usuário pelo ID com suas tarefas associadas
router.get('/:id', (req, res) => {
  const userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send(err.message);
    if (!user) return res.status(404).send('Usuário não encontrado');

    res.json(user);
  });
});



// Atualizar parcialmente um usuário
router.patch('/:id', (req, res) => {
  const { nome, nivel, exp, patente } = req.body;

  // Crie um objeto com os campos que foram passados
  const updates = {};
  if (nome !== undefined) updates.nome = nome;
  if (nivel !== undefined) updates.nivel = nivel;
  if (exp !== undefined) updates.exp = exp;
  if (patente !== undefined) updates.patente = patente;

  // Verifica se há algum campo para atualizar
  if (Object.keys(updates).length === 0) {
    return res.status(400).send('Nenhum campo válido para atualizar');
  }

  // Chame a função de atualização
  User.updatePartial(req.params.id, updates, (err, changes) => {
    if (err) return res.status(500).send(err.message);
    if (changes === 0) return res.status(404).send('Usuário não encontrado');
    res.sendStatus(204); // Sucesso, sem conteúdo
  });
});


// Deletar um usuário
router.delete('/:id', (req, res) => {
  User.delete(req.params.id, (err, changes) => {
    if (err) return res.status(500).send(err.message);
    if (changes === 0) return res.status(404).send('Usuário não encontrado');
    res.sendStatus(204);
  });
});

module.exports = router;
