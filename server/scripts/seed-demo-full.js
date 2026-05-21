/**
 * Nạp lại dữ liệu demo (order, bếp, báo cáo) — giữ nhân viên, món, bàn.
 * Chạy: npm run seed-demo
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_ROOT_USER || 'root',
    password: process.env.DB_ROOT_PASSWORD || '',
    database: process.env.DB_NAME || 'ql_golden_taste',
    multipleStatements: true,
  });
  const sql = fs.readFileSync(
    path.join(__dirname, '../../database/golden_taste/05_demo_full.sql'),
    'utf8'
  );
  await conn.query(sql);
  console.log('Đã nạp dữ liệu demo — mở http://localhost:3001 và đăng nhập admin.');
  await conn.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
