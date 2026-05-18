require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'https://control-escolar-web.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes'));

app.get('/up', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error del servidor.',
  });
});

sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
