const { Server } = require('http');
const { app } = require('./handlers');

const server = new Server(app.serve.bind(app));
server.listen(8000, () => console.log('listening on 8000'));
