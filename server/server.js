const express = require('express');
const cors = require('cors');
const path = require('path');

// Load .env từ server directory hoặc parent directory
const envPath = path.join(__dirname, '.env');
const parentEnvPath = path.join(__dirname, '..', '.env');
const fs = require('fs');

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath, override: true });
} else if (fs.existsSync(parentEnvPath)) {
  require('dotenv').config({ path: parentEnvPath, override: true });
} else {
  require('dotenv').config({ override: true });
}

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const reservationRoutes = require('./routes/reservations');
const permissionRoutes = require('./routes/permissions');
const featureRoutes = require('./routes/features');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;
const pool = require('./config/db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'nha-hang-api' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

async function checkSchema() {
  try {
    await pool.query('SELECT 1 FROM CHUC_NANG LIMIT 1');
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') {
      console.warn(
        '[DB] Thiếu bảng CHUC_NANG — chạy trong thư mục server: npm run migrate-chuc-nang'
      );
    }
  }
}

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  checkSchema();
});
