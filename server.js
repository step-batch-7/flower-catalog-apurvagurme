const fs = require('fs');
const { Server } = require('net');
const Request = require('./lib/request');
const Response = require('./lib/response');
const STATIC_FOLDER = `${__dirname}/public`;
const CONTENT_TYPES = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif',
  jpg: 'image/jpeg'
};

const serveHomePage = function(req) {
  req.url = '/index.html';
  const res = serveStaticPage(req);
  return res;
};

const serveStaticPage = function(req) {
  const path = `${STATIC_FOLDER}${req.url}`;
  const status = fs.existsSync(path) && fs.statSync(path);
  if (!status || !status.isFile) return new Response();
  const content = fs.readFileSync(path);
  const [, extension] = req.url.split('.');
  const contentType = CONTENT_TYPES[extension];
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const findHandler = function(req) {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'GET') return serveStaticPage;
  return () => new Response();
};

const handleConnection = function(socket) {
  socket.setEncoding('utf8');
  socket.on('close', () => console.warn(`${socket.remote} closed `));
  socket.on('end', () => console.warn(`${socket.remote} ended`));
  socket.on('err', err => console.error(err));
  socket.on('data', text => {
    const req = Request.parse(text);
    const handler = findHandler(req);
    const res = handler(req);
    console.log(res);
    res.writeTo(socket);
  });
};

const main = function() {
  const server = new Server();
  server.on('listening', () => console.log('listening'));
  server.on('error', err => console.error(err));
  server.on('connection', handleConnection);
  server.listen(8000);
};

main();
