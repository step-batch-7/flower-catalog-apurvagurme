const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATE_FOLDER = `${__dirname}/templates`;
const CONTENT_TYPES = require('./lib/contentType');
const records = require('./commentRecords.json');
const querystring = require('querystring');
const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { App } = require('./app.js');

const storeRecord = function(keyAndValue, records) {
  const newRecord = querystring.parse(keyAndValue);
  newRecord.date = new Date().toJSON();
  records.unshift(newRecord);
  const content = JSON.stringify(records, null, 2);
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

const createTable = function() {
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
  storeRecord(req.body, records);
  res.writeHead(303, { location: '/guestBook.html' });
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
  res.setHeader('contentType', contentType);
  res.end(content);
};

const serveGuestPage = function(req, res) {
  const path = `${TEMPLATE_FOLDER}${req.url}`;
  const html = createTable();
  const content = readFileSync(path, 'utf8');
  const contentType = getContentType(req.url);
  const replaced = content.replace('__COMMENT-LIST__', html);
  res.setHeader('contentType', contentType);
  res.end(replaced);
};

const notFound = function(req, res) {
  res.writeHead(404);
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
