/**
 * Import schema Golden Taste lên MySQL cloud (Railway, TiDB, …)
 * Chạy: set DATABASE_URL rồi npm run import-cloud-db
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.MYSQL_PUBLIC_URL;

if (!dbUrl) {
  console.error('Thiếu DATABASE_URL hoặc MYSQL_URL');
  process.exit(1);
}

const goldenDir = path.join(__dirname, '../../database/golden_taste');

function stripLocalDbCommands(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !/^\s*CREATE\s+DATABASE/i.test(line) && !/^\s*USE\s+/i.test(line))
    .join('\n');
}

function parseUrl(urlString) {
  const url = new URL(urlString);
  const config = {
    host: url.hostname,
    port: parseInt(url.port || '3306', 10),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '').split('?')[0],
    multipleStatements: true,
    charset: 'utf8mb4',
  };
  if (process.env.DB_SSL === 'true' || url.port === '4000') {
    config.ssl = { rejectUnauthorized: false };
  }
  return config;
}

async function run() {
  const config = parseUrl(dbUrl);
  console.log('Kết nối MySQL:', config.host, 'DB:', config.database);
  const conn = await mysql.createConnection(config);

  for (const f of ['01_schema.sql', '02_views.sql', '03_seed.sql', '04_chuc_nang_seed.sql']) {
    console.log('Running', f);
    const sql = stripLocalDbCommands(fs.readFileSync(path.join(goldenDir, f), 'utf8'));
    await conn.query(sql);
  }

  const hash = await bcrypt.hash('password123', 10);
  await conn.query('UPDATE NHANVIEN SET matKhauHash = ?', [hash]);
  console.log('Mật khẩu nhân viên → password123');
  await conn.end();
  console.log('Import cloud DB (Golden Taste) xong.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
