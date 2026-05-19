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

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'nha-hang-api' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
