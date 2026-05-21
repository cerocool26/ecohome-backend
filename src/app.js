require('dotenv').config();
const express = require('express');
const http    = require('http');
const cors    = require('cors');
const { Server } = require('socket.io');

const initChat = require('./sockets/chat');

const app = express();

// CORS abierto en dev — restringir en producción
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'EcoHome Backend', version: '1.1.0' });
});

// Rutas REST
app.use('/auth',     require('./routes/auth.routes'));
app.use('/products', require('./routes/products.routes'));

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Error handler global
app.use((err, req, res, _next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Inicializa namespace de chat con auth JWT
initChat(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`EcoHome API REST corriendo en http://localhost:${PORT}`);
  console.log(`Socket.IO escuchando en ws://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };
