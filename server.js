// server.js
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const atributoRoutes = require("./routes/atributoRoutes");

app.use(express.json());

// Rotas
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use("/atributos", atributoRoutes);

// Porta
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
