const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

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
      if (delim !== ';') {
        stmt = stmt.replace(new RegExp(`${delim}\\s*$`, 'm'), ';');
      }
      statements.push(stmt);
      buf = '';
    }
  }
  if (buf.trim()) statements.push(buf);
  return statements
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'));
}

async function runSqlFile(conn, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const parts = splitSqlFile(sql);
  for (const part of parts) {
    await conn.query(part);
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

  if (process.env.RESET_DB === '1') {
    console.log('RESET_DB=1 → drop nha_hang_db');
    await conn.query('DROP DATABASE IF EXISTS nha_hang_db');
  }
  await conn.query(
    'CREATE DATABASE IF NOT EXISTS nha_hang_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
  );
  await conn.query('USE nha_hang_db');

  const runWhole = new Set(['01_schema.sql', '02_seed.sql', '03_views.sql', '08_ai.sql']);
  for (const f of files) {
    console.log('Running', f);
    const fp = path.join(dbDir, f);
    if (runWhole.has(f)) {
      await conn.query(fs.readFileSync(fp, 'utf8'));
    } else {
      await runSqlFile(conn, fp);
    }
  }

  const hash = await bcrypt.hash('password123', 10);
  await conn.query(`USE nha_hang_db`);
  await conn.query('UPDATE nhan_vien SET mat_khau_hash = ?', [hash]);
  console.log('Updated passwords to password123');

  const appUser = (process.env.DB_USER || 'nh_app').replace(/[^a-zA-Z0-9_]/g, '');
  const appPass = (process.env.DB_PASSWORD || 'App@123').replace(/'/g, "''");
  for (const host of ['localhost', '127.0.0.1']) {
    await conn.query(
      `CREATE USER IF NOT EXISTS '${appUser}'@'${host}' IDENTIFIED BY '${appPass}'`
    );
    await conn.query(`GRANT ALL PRIVILEGES ON nha_hang_db.* TO '${appUser}'@'${host}'`);
  }
  await conn.query('FLUSH PRIVILEGES');
  console.log(`App user '${appUser}' ready`);

  try {
    await runSqlFile(conn, path.join(dbDir, '07_permissions.sql'));
    console.log('Role permissions applied');
  } catch (e) {
    console.warn('Role permissions skipped:', e.message);
  }

  await conn.end();
  console.log('Database setup complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
