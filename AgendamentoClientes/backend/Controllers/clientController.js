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

    // Validação de campos obrigatórios
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

// Rota para atualizar informações do cliente dinamicamente
exports.updateClient = async (req, res) => {
  const id = req.params.id;
  const fields = req.body;

  // Verifica se foi enviado ao menos um campo para atualização
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "Nenhum dado foi fornecido para atualização." });
  }

  // Lista de campos permitidos para atualização
  const validFields = [
    "nome",
    "quantidade_placas",
    "valor_servico",
    "proxima_data_agendamento",
    "data_marcada",
    "valor_marcado",
    "descricao_servico",
    "status_servico_id",
    "endereco",
    "cidade",
    "telefone"
  ];

  let setClause = [];
  let values = [];
  let index = 1;

  // Constrói dinamicamente a cláusula SET com os campos válidos enviados
  for (let key in fields) {
    if (validFields.includes(key)) {
      setClause.push(`${key} = $${index}`);
      values.push(fields[key]);
      index++;
    }
  }

  // Se nenhum campo válido foi enviado
  if (setClause.length === 0) {
    return res.status(400).json({ error: "Nenhum campo válido para atualização." });
  }

  // Adiciona o id do cliente para o WHERE
  values.push(id);
  const query = `UPDATE cliente SET ${setClause.join(', ')} WHERE id_cliente = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json({ message: "Cliente atualizado com sucesso", cliente: result.rows[0] });
  } catch (err) {
    console.error("Erro ao atualizar cliente:", err.message);
    res.status(500).json({ error: "Erro ao atualizar cliente: " + err.message });
  }
};

