const express = require('express');
const cors = require('cors');
const pool = require('./connectData');

const app = express();
app.use(express.json());
app.use(cors());

// Rota para buscar clientes
app.get('/clientes', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM public.cliente`);
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

// Rota para adicionar um novo registro de histórico
app.post('/historico', async (req, res) => {
  const { cliente_id, descricao, valor, data_historico } = req.body;
  if (!cliente_id || !descricao || !valor || !data_historico) {
    return res.status(400).json({ error: 'cliente_id, descricao, valor e data_historico são obrigatórios' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO historico_cliente (cliente_id, descricao, valor, data_historico)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [cliente_id, descricao, valor, data_historico]
    );
    res.status(201).json({ message: 'Histórico adicionado com sucesso', historico: result.rows[0] });
  } catch (err) {
    console.error('Erro ao adicionar histórico:', err.message);
    res.status(500).json({ error: 'Erro ao adicionar histórico' });
  }
});

// Rota para buscar histórico do cliente
app.get('/historico/:cliente_id', async (req, res) => {
  const cliente_id = req.params.cliente_id;
  try {
    const result = await pool.query(
      `SELECT * FROM historico_cliente WHERE cliente_id = $1 ORDER BY data_historico DESC`,
      [cliente_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar histórico:', err.message);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

// Rota para excluir um registro do histórico
app.delete('/historico/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM historico_cliente WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.json({ message: 'Registro excluído com sucesso', registro: result.rows[0] });
  } catch (err) {
    console.error('Erro ao excluir histórico:', err.message);
    res.status(500).json({ error: 'Erro ao excluir histórico' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

