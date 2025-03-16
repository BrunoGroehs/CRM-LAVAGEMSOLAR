/* 
  //clientController.js
  (Contém a lógica que estava no app.js para os endpoints de clientes)
*/
const pool = require('../Config/connectData');

// Rota para buscar clientes
exports.getAllClients = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM public.cliente`);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err.message);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};

// Rota para adicionar um novo cliente
exports.createClient = async (req, res) => {
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
};
