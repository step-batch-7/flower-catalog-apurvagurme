const STATIC_FOLDER = `${__dirname}/../public`;
const TEMPLATE_FOLDER = `${__dirname}/../templates`;
const CONTENT_TYPES = require('./contentType');
const COMMENT_STORE = `${__dirname}/../commentRecords.json`;
const { Comment, Comments } = require('./comment');

const comments = Comments.load(require(COMMENT_STORE));

const querystring = require('querystring');
const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { App } = require('./app.js');
const { statusCode } = require('./statusCode');

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = querystring.parse(data);
    next();
  });
};

const saveCommentAndRedirect = function(req, res) {
  const comment = new Comment(req.body.name, req.body.comment, new Date());
  comments.addComment(comment);
  writeFileSync(COMMENT_STORE, comments.toJSON());
  res.writeHead(statusCode.redirection, { location: '/guestBook.html' });
  res.end();
};

const getContentType = function(url) {
  const [, extension] = url.split('.');
  return CONTENT_TYPES[extension];
};

const getStatus = path => existsSync(path) && statSync(path);

const serveStaticPage = function(req, res, next) {
  if (req.url === '/') {
    req.url = '/index.html';
  }
  const path = `${STATIC_FOLDER}${req.url}`;
  const status = getStatus(path);
  if (!status || !status.isFile()) {
    return next();
  }
  const content = readFileSync(path);
  const contentType = getContentType(req.url);
  res.writeHead(statusCode.ok, { 'Content-Type': contentType, 'Content-Length': content.length });
  res.end(content);
};

const serveGuestPage = function(req, res) {
  const path = `${TEMPLATE_FOLDER}${req.url}`;
  const content = readFileSync(path, 'utf8');
  const contentType = getContentType(req.url);
  const replaced = content.replace('__COMMENT-LIST__', comments.toHTML());
  res.writeHead(statusCode.ok, { 'Content-Type': contentType });
  res.end(replaced);
};

const notFound = function(req, res) {
  res.writeHead(statusCode.notFound);
  res.end('Not Found');
};

const app = new App();

app.use(readBody);

app.get('/guestBook.html', serveGuestPage);
app.get('', serveStaticPage);
app.get('', notFound);

app.post('/guestBook.html', saveCommentAndRedirect);
app.post('', notFound);

module.exports = { app };
