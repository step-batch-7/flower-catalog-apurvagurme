const { Server } = require('http');
const { app } = require('./lib/handlers');
const port = process.env.port || 8000;
const server = new Server(app.serve.bind(app));
server.listen(port);
