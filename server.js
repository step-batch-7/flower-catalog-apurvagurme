const { Server } = require('http');
const { findHandler } = require('./app');

const requestListener = function(req, res) {
  const handler = findHandler(req);
  return handler(req, res);
};

const main = function() {
  const server = new Server(requestListener);
  server.on('listening', () => console.warn('listening'));
  server.on('error', err => console.error(err));
  server.listen(8000);
};

main();
