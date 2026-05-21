/**
 * Thêm bảng CHUC_NANG vào DB đã có (không xóa dữ liệu cũ).
 * Chạy: node scripts/migrate-chuc-nang.js
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

  await conn.query(`
    CREATE TABLE IF NOT EXISTS CHUC_NANG (
      maCN CHAR(6) NOT NULL PRIMARY KEY,
      maTrang VARCHAR(30) NOT NULL UNIQUE,
      tenCN VARCHAR(120) NOT NULL,
      icon VARCHAR(12) NOT NULL DEFAULT '📌',
      moTa TEXT NOT NULL,
      vaiTroPhep VARCHAR(200) NOT NULL,
      apiMoTa TEXT NULL,
      thuTu INT NOT NULL DEFAULT 0,
      hienThi TINYINT(1) NOT NULL DEFAULT 1,
      capNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

  const [[{ c }]] = await conn.query('SELECT COUNT(*) AS c FROM CHUC_NANG');
  if (c === 0) {
    const seed = fs.readFileSync(
      path.join(__dirname, '../../database/golden_taste/04_chuc_nang_seed.sql'),
      'utf8'
    );
    await conn.query(seed.replace(/^\s*USE\s+ql_golden_taste\s*;?\s*/i, ''));
    console.log('Đã seed CHUC_NANG');
  } else {
    console.log('CHUC_NANG đã có', c, 'bản ghi');
  }
  await conn.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
