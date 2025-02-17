const express = require('express');
const cors = require('cors');
const pool = require('./connectData');

const app = express();
app.use(express.json());
app.use(cors());

// Rota para buscar contatos
app.get('/contatos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contato');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar contatos:', err.message);
    res.status(500).json({ error: 'Erro ao buscar contatos' });
  }
});

// Rota para adicionar um novo contato
app.post('/contatos', async (req, res) => {
  try {
    const { nome, celular, email, dataNasc } = req.body;

    if (!nome || !celular || !email || !dataNasc) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO contato (s_nome_contato, n_contato_contato, s_email_contato, s_dtnasc_contato) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, celular, email, dataNasc]
    );

    res.status(201).json({ message: 'Contato criado com sucesso', contato: result.rows[0] });
  } catch (err) {
    console.error('Erro ao inserir contato:', err.message);
    res.status(500).json({ error: 'Erro ao inserir contato' });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
