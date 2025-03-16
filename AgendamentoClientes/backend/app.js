/* 
  //app.js (antigo)
*/
const express = require('express');
const cors = require('cors');
const path = require('path');

// Rotas separadas
const clientRoutes = require('./routes/clientRoutes');
const historicoRoutes = require('./routes/historicoRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas
app.use('/clientes', clientRoutes);
app.use('/historico', historicoRoutes);

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
