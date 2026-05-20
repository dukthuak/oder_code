const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), override: true });

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQL_PUBLIC_URL
  );
}

function buildPoolConfig() {
  const dbUrl = getDatabaseUrl();
  if (dbUrl) {
    const url = new URL(dbUrl);
    const config = {
      host: url.hostname,
      port: parseInt(url.port || '3306', 10),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, '').split('?')[0],
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4',
    };
    if (process.env.DB_SSL === 'true') {
      config.ssl = { rejectUnauthorized: false };
    }
    return config;
  }
  return {
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

const pool = mysql.createPool(buildPoolConfig());

module.exports = pool;
