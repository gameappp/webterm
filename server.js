const express = require('express');
const next = require('next');
const http = require('http');
const { rpsSocket } = require('./src/sockets/rpsSocket');
const { tictactoeSocket } = require('./src/sockets/tictactoeSocket');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // ساخت یک socket server واحد برای همه بازی‌ها
  rpsSocket(httpServer); // این io رو می‌سازه و export می‌کنه
  const { io, onlineUsers } = require('./src/sockets/rpsSocket');
  tictactoeSocket(httpServer, io, onlineUsers); // از همون io و onlineUsers استفاده می‌کنه

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 server running in port ${port}`);
  });
});
