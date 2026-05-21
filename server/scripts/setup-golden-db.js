const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const goldenDir = path.join(__dirname, '../../database/golden_taste');
const seedSource = path.join(__dirname, '../../docs/QL_cuahanggoldentaste.sql');

function stripTsqlSeed(sql) {
  return sql
    .replace(/\bN'/g, "'")
    .replace(/^\s*GO\s*$/gim, '')
    .replace(/INSERT INTO NHANVIEN \([^)]+\)/i, 'INSERT INTO NHANVIEN (maNV, hotenNV, ngaySINH, gioiTINH, SDT, emailNV, chucVU, luongCB)');
}

async function runFile(conn, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await conn.query(sql);
}

async function runSeedFromDocs(conn) {
  const raw = fs.readFileSync(seedSource, 'utf8');
  const start = raw.indexOf('INSERT INTO LOAIMON');
  const end = raw.indexOf("SELECT * FROM MONAN WHERE maMON = 'MA001'");
  if (start < 0 || end < 0) throw new Error('Không tìm thấy khối INSERT trong QL_cuahanggoldentaste.sql');
  const block = stripTsqlSeed(raw.slice(start, end));
  const stmts = block.match(/INSERT[\s\S]*?;/gi) || [];
  for (let stmt of stmts) {
    stmt = stmt.replace(/--[^\r\n]*/g, '').trim();
    if (stmt) await conn.query(stmt);
  }
}

async function run() {
  const rootUser = process.env.DB_ROOT_USER || 'root';
  const rootPass = process.env.DB_ROOT_PASSWORD || process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  const conn = await mysql.createConnection({
    host,
    port,
    user: rootUser,
    password: rootPass,
    multipleStatements: true,
  });

  console.log('Chạy schema Golden Taste...');
  await runFile(conn, path.join(goldenDir, '01_schema.sql'));
  await runFile(conn, path.join(goldenDir, '02_views.sql'));
  console.log('Import dữ liệu mẫu...');
  await runSeedFromDocs(conn);

  const hash = await bcrypt.hash('password123', 10);
  await conn.query('USE ql_golden_taste');
  await conn.query('UPDATE NHANVIEN SET matKhauHash = ?', [hash]);

  const appUser = (process.env.DB_USER || 'nh_app').replace(/[^a-zA-Z0-9_]/g, '');
  const appPass = (process.env.DB_PASSWORD || 'App@123').replace(/'/g, "''");
  for (const host of ['localhost', '127.0.0.1']) {
    await conn.query(
      `CREATE USER IF NOT EXISTS '${appUser}'@'${host}' IDENTIFIED BY '${appPass}'`
    );
    await conn.query(`GRANT ALL PRIVILEGES ON ql_golden_taste.* TO '${appUser}'@'${host}'`);
  }
  await conn.query('FLUSH PRIVILEGES');
  console.log(`User MySQL '${appUser}' đã có quyền ql_golden_taste`);
  console.log('Mật khẩu tất cả NV: password123');
  console.log('DB: ql_golden_taste — xong.');
  await conn.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
