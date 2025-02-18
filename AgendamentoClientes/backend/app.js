const express = require('express');
const cors = require('cors');
const pool = require('./connectData');

const app = express();
app.use(express.json());
app.use(cors());

// Rota para buscar clientes
app.get('/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cliente'); // Tabela correta
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err.message);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Rota para adicionar um novo cliente
app.post('/clientes', async (req, res) => {
  try {
    const { nome, celular, email, dataNasc } = req.body;

    if (!nome || !celular || !email || !dataNasc) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO cliente (nome, celular, email, data_nascimento) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, celular, email, dataNasc]
    );

    res.status(201).json({ message: 'Cliente criado com sucesso', cliente: result.rows[0] });
  } catch (err) {
    console.error('Erro ao inserir cliente:', err.message);
    res.status(500).json({ error: 'Erro ao inserir cliente' });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
