const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Crucial: Permite a conexão segura com a nuvem
    }
});

module.exports = pool;