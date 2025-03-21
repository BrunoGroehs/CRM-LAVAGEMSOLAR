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

// Rota para atualizar informações do cliente (status e tempo de recontato)
// Rota para atualizar informações do cliente (apenas status)
exports.updateClient = async (req, res) => {
  const id = req.params.id;
  const { status_cliente } = req.body; // Removido tempo_recontato

  if (!status_cliente) {
    return res.status(400).json({ error: "O status do cliente é obrigatório." });
  }

  // Converter para inteiro
  const statusInt = parseInt(status_cliente, 10);

  if (isNaN(statusInt)) {
    return res.status(400).json({ error: "Status inválido." });
  }

  try {
    // Query atualizada (somente status_servico_id)
    const result = await pool.query(
      'UPDATE cliente SET status_servico_id = $1 WHERE id_cliente = $2 RETURNING *',
      [statusInt, id] // Apenas 2 parâmetros
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json({ message: "Cliente atualizado com sucesso", cliente: result.rows[0] });
  } catch (err) {
    console.error("Erro detalhado:", err.message);
    res.status(500).json({ error: "Erro ao atualizar cliente: " + err.message });
  }
};