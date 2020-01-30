const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATE_FOLDER = `${__dirname}/templates`;
const CONTENT_TYPES = require('./lib/contentType');
const querystring = require('querystring');
const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { App } = require('./app.js');

const storeRecord = function(keyAndValue, records) {
  const { name, comment } = querystring.parse(keyAndValue);
  const date = new Date().toJSON();
  const newRecord = { date, name, comment };
  const oldRecords = JSON.parse(records);
  oldRecords.unshift(newRecord);
  const content = JSON.stringify(oldRecords, null, 2);
  writeFileSync('./commentRecords.json', content);
};

const createRows = function(container, record) {
  const row = `<tr>
    <td>${new Date(record.date).toLocaleString()}</td>
    <td>${record.name}</td>
    <td>${record.comment}</td>
    </tr>`;
  return container.concat(row);
};

const createTable = function(records) {
  const table = records.reduce(createRows, '');
  return table;
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const saveCommentAndRedirect = function(req, res) {
  const records = readFileSync('./commentRecords.json', 'utf8');
  storeRecord(req.body, records);
  res.writeHead(303, { location: '/guestBook.html' });
  res.end();
};

const getContentType = function(url) {
  const [, extension] = url.split('.');
  return CONTENT_TYPES[extension];
};

const serveStaticPage = function(req, res, next) {
  const path = `${STATIC_FOLDER}${req.url}`;
  const status = existsSync(path) && statSync(path);
  if (!status || !status.isFile()) {
    return next();
  }
  const content = readFileSync(path);
  const contentType = getContentType(req.url);
  res.setHeader('contentType', contentType);
  res.end(content);
};

const serveGuestPage = function(req, res) {
  const path = `${TEMPLATE_FOLDER}${req.url}`;
  let records = readFileSync('./commentRecords.json', 'utf8');
  records = JSON.parse(records);
  const html = createTable(records);
  const content = readFileSync(path, 'utf8');
  const contentType = getContentType(req.url);
  const replaced = content.replace('__COMMENT-LIST__', html);
  res.setHeader('contentType', contentType);
  res.end(replaced);
};

const serveHomePage = function(req, res) {
  req.url = '/index.html';
  serveStaticPage(req, res);
};

const notFound = function(req, res) {
  res.writeHead(404);
  res.end('Not Found');
};

const app = new App();

app.use(readBody);

app.get('/guestBook.html', serveGuestPage);
app.get('', serveStaticPage);
app.get('/', serveHomePage);
app.get('', notFound);

app.post('/guestBook.html', saveCommentAndRedirect);
app.post('', notFound);

module.exports = { app };
