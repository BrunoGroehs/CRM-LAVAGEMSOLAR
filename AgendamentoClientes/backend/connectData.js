const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',  // Ou o IP do servidor
  database: 'agenda',
  password: 'ratta100',
  port: 5432, // Porta padrão do PostgreSQL
});

module.exports = pool;
