const jwt = require('jsonwebtoken');

// Historial en memoria (suficiente para la demo).
// Para producción, persistir en PostgreSQL.
const MAX_HISTORY = 100;
const history = [];

/**
 * Inicializa el namespace /chat con autenticación JWT.
 * El cliente debe conectarse pasando el token:
 *   io('http://host:3000/chat', { auth: { token: 'eyJ...' } })
 */
function initChat(io) {
  const chat = io.of('/chat');

  // Middleware de autenticación — se ejecuta en el handshake
  chat.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Token requerido'));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error('Token inválido o expirado'));
    }
  });

  chat.on('connection', (socket) => {
    console.log(`[chat] conectado user=${socket.user.id} role=${socket.user.role}`);

    // Enviar historial al cliente recién conectado
    socket.emit('message:history', history);

    // Broadcast de entrada
    chat.emit('system:event', {
      type: 'join',
      userId: socket.user.id,
      at: new Date().toISOString(),
    });

    // Nuevo mensaje
    socket.on('message:send', (payload, ack) => {
      const text = (payload && typeof payload.text === 'string') ? payload.text.trim() : '';
      if (!text) {
        if (typeof ack === 'function') ack({ ok: false, error: 'Mensaje vacío' });
        return;
      }

      const message = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        userId: socket.user.id,
        role: socket.user.role,
        text,
        at: new Date().toISOString(),
      };

      history.push(message);
      if (history.length > MAX_HISTORY) history.shift();

      chat.emit('message:new', message);
      if (typeof ack === 'function') ack({ ok: true, id: message.id });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[chat] desconectado user=${socket.user.id} reason=${reason}`);
      chat.emit('system:event', {
        type: 'leave',
        userId: socket.user.id,
        at: new Date().toISOString(),
      });
    });
  });
}

module.exports = initChat;
