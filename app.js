const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATE_FOLDER = `${__dirname}/templates`;
const Response = require('./lib/response');
const fs = require('fs');
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

const serveGuestBook = function(req) {
  const path = `${TEMPLATE_FOLDER}${req.url}`;
  const status = fs.existsSync(path) && fs.statSync(path);

  if (!status || !status.isFile) return new Response();
  let content = fs.readFileSync(path);

  const [, extension] = req.url.split('.');
  const contentType = CONTENT_TYPES[extension];
  const res = new Response();

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const saveComment = function(req) {
  const path = `${TEMPLATE_FOLDER}/guestBook.html`;
  let content = fs.readFileSync(path, 'utf8');
  const replaced = content.replace(
    '__COMMENT-LIST__',
    `<td>${new Date().toLocaleString()}</td><td>${req.body.name}</td><td>${
      req.body.comment
    }</td></tr>`
  );
  const [, extension] = req.url.split('.');
  const contentType = CONTENT_TYPES[extension];
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = replaced;
  return res;
};

const findHandler = function(req) {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'GET' && req.url === '/guestBook.html') return serveGuestBook;
  if (req.method === 'GET') return serveStaticPage;
  if (req.method === 'POST' && req.url === '/addComment') return saveComment;
  return () => new Response();
};

exports.findHandler = findHandler;
