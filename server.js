const net = require('net');
const { Server } = net;
const fs = require('fs');
const homePage = fs.readFileSync('./public/index.html', 'utf8');
const DIR_PATH = `${__dirname}/public`;

const getResponse = function(contentType, content) {
  const defaultResponse = [
    'HTTP/1.0 200 OK',
    `Content-type: ${contentType}`,
    `Content-Length: ${content.length}`,
    '',
    content
  ].join('\n');
  return defaultResponse;
};

const getRequest = function(text) {
  const [request, ...headers] = text.split('\n');
  const [method, url, protocol] = request.split(' ');
  const req = { request, headers, method, url, protocol };
  return req;
};

const generateResponse = function(req) {
  let res = '';
  if (req.method == 'GET' && req.url == '/') res = getResponse('html', homePage);
  // if (req.method === 'GET') res = serveStaticFile(req);
  return res;
};

const handleRequest = function(socket) {
  socket.setEncoding('utf8');
  socket.on('data', data => {
    const req = getRequest(data);
    const res = generateResponse(req);
    socket.write(res);
  });
};

const main = function() {
  const server = new Server();
  server.on('listening', () => console.log('listening'));
  server.on('error', err => console.log(err));
  server.on('connection', handleRequest);
  server.listen(8000);
};

main();
