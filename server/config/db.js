const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), override: true });

// Support Railway DATABASE_URL format
let poolConfig;

if (process.env.DATABASE_URL) {
  // Parse Railway DATABASE_URL: mysql://user:password@host:port/database
  const url = new URL(process.env.DATABASE_URL);
  poolConfig = {
    host: url.hostname,
    port: parseInt(url.port || '3306', 10),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nha_hang_db',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
  };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
