/**
 * Import schema + seed lên MySQL cloud (Railway, v.v.)
 * Chạy: set DATABASE_URL rồi: npm run import-cloud-db
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
  console.error('Thiếu DATABASE_URL hoặc MYSQL_URL (copy từ Railway MySQL → Variables)');
  process.exit(1);
}

const dbDir = path.join(__dirname, '../../database');
const files = [
  '01_schema.sql',
  '02_seed.sql',
  '08_ai.sql',
  '03_views.sql',
  '04_functions.sql',
  '05_procedures.sql',
  '06_triggers.sql',
];

function splitSqlFile(sql) {
  const statements = [];
  let buf = '';
  let delim = ';';
  for (const line of sql.split(/\r?\n/)) {
    const m = line.match(/^DELIMITER\s+(\S+)/i);
    if (m) {
      if (buf.trim()) statements.push(buf);
      buf = '';
      delim = m[1] === ';' ? ';' : m[1];
      continue;
    }
    buf += `${line}\n`;
    if (line.trim().endsWith(delim)) {
      let stmt = buf;
      if (delim !== ';') stmt = stmt.replace(new RegExp(`${delim}\\s*$`, 'm'), ';');
      statements.push(stmt);
      buf = '';
    }
  }
  if (buf.trim()) statements.push(buf);
  return statements.map((s) => s.trim()).filter((s) => s && !s.startsWith('--'));
}

function stripLocalDbCommands(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !/^\s*CREATE\s+DATABASE/i.test(line))
    .join('\n')
    .replace(/^\s*USE\s+nha_hang_db\s*;?\s*$/gim, '');
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
  if (process.env.DB_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
  }
  return config;
}

async function runSqlFile(conn, filePath) {
  const sql = stripLocalDbCommands(fs.readFileSync(filePath, 'utf8'));
  const parts = splitSqlFile(sql);
  for (const part of parts) {
    if (part) await conn.query(part);
  }
}

async function run() {
  const config = parseUrl(dbUrl);
  console.log('Kết nối MySQL:', config.host, 'DB:', config.database);
  const conn = await mysql.createConnection(config);

  const runWhole = new Set(['01_schema.sql', '02_seed.sql', '03_views.sql', '08_ai.sql']);
  for (const f of files) {
    console.log('Running', f);
    const fp = path.join(dbDir, f);
    if (runWhole.has(f)) {
      await conn.query(stripLocalDbCommands(fs.readFileSync(fp, 'utf8')));
    } else {
      await runSqlFile(conn, fp);
    }
  }

  const hash = await bcrypt.hash('password123', 10);
  await conn.query('UPDATE nhan_vien SET mat_khau_hash = ?', [hash]);
  console.log('Mật khẩu nhân viên → password123');
  await conn.end();
  console.log('Import cloud DB xong.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
