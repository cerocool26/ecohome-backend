require('dotenv').config();
const express = require('express');

const app = express();

// Parseo de JSON
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'EcoHome Backend', version: '1.0.0' });
});

// Rutas principales
app.use('/auth',     require('./routes/auth.routes'));
app.use('/products', require('./routes/products.routes'));

// 404 para rutas no definidas
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Manejador global de errores
app.use((err, req, res, _next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EcoHome API corriendo en http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
