/* 
  //historicoController.js
  (Contém a lógica que estava no app.js para os endpoints de histórico)
*/
const pool = require('../Config/connectData');

// Rota para adicionar um novo registro de histórico
exports.addHistorico = async (req, res) => {
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
};

// Rota para buscar histórico do cliente
exports.getHistoricoByClient = async (req, res) => {
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
};

// Rota para excluir um registro do histórico
exports.deleteHistorico = async (req, res) => {
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
};
