const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  max:      10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Error inesperado en pool de PostgreSQL:', err.message);
  process.exit(-1);
});

module.exports = pool;
