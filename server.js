const { Server } = require('net');
const Request = require('./lib/request');
const findHandler = require('./app').findHandler;

const handleConnection = function(socket) {
  socket.setEncoding('utf8');
  socket.on('close', () => console.warn(`closed `));
  socket.on('end', () => console.warn(`ended`));
  socket.on('err', err => console.error(err));
  socket.on('data', text => {
    const req = Request.parse(text);
    const handler = findHandler(req);
    const res = handler(req);
    res.writeTo(socket);
  });
};

const main = function() {
  const server = new Server();
  server.on('listening', () => console.warn('listening'));
  server.on('error', err => console.error(err));
  server.on('connection', handleConnection);
  server.listen(8000);
};

main();
