const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATE_FOLDER = `${__dirname}/templates`;
const CONTENT_TYPES = require('./lib/contentType');
const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');

const storeRecord = function(keyAndValue, records) {
  const date = new Date().toJSON();
  const { name, comment } = keyAndValue;
  const newRecord = { date, name, comment };
  const oldRecords = JSON.parse(records);
  oldRecords.unshift(newRecord);
  const content = JSON.stringify(oldRecords);
  writeFileSync('./commentRecords.json', content);
};

const createRows = function(container, record) {
  const row = `<tr>
    <td>${record.date}</td>
    <td>${record.name}</td>
    <td>${record.comment}</td>
    </tr>`;
  return container.concat(row);
};

const createTable = function(records) {
  const table = records.reduce(createRows, '');
  return table;
};

const pickupParams = function(query, keyValuePair) {
  const [key, value] = keyValuePair.split('=');
  query[key] = value;
  return query;
};

const readParams = keyValueTextPair => keyValueTextPair.split('&').reduce(pickupParams, {});

const collectBody = function(body) {
  let { name, comment } = readParams(body);
  name = decodeURIComponent(name);
  comment = decodeURIComponent(comment);
  name = name.replace(/\+/g, ' ');
  comment = comment.replace(/\+/g, ' ');
  body = { name, comment };
  return body;
};

const redirectTo = (url, res) => {
  res.setHeader('Location', url);
  res.setHeader('Content-Length', 0);
  res.statusCode = 301;
  res.end();
};

const saveCommentAndRedirect = function(req, res) {
  let data = '';
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    data = collectBody(data);
    let records = readFileSync('./commentRecords.json', 'utf8');
    storeRecord(data, records);
    records = readFileSync('./commentRecords.json', 'utf8');
    const path = `${TEMPLATE_FOLDER}/guestBook.html`;
    const content = readFileSync(path, 'utf8');
    const table = createTable(JSON.parse(records));
    const replaced = content.replace('__COMMENT-LIST__', table);
    const contentType = 'text/html';
    res.setHeader('contentType', contentType);
    redirectTo('/guestBook.html', res);
    res.end(replaced);
  });
};

const getContentType = function(url) {
  const [, extension] = url.split('.');
  return CONTENT_TYPES[extension];
};

const serveStaticPage = function(req, res) {
  const path = `${STATIC_FOLDER}${req.url}`;
  const status = existsSync(path) && statSync(path);
  if (!status || !status.isFile()) return notFound(req, res);
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
  return;
};

const serveHomePage = function(req, res) {
  req.url = '/index.html';
  serveStaticPage(req, res);
};

const notFound = function(req, res) {
  res.writeHead(404);
  res.end('Not Found');
};

const findHandler = function(req) {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'GET' && req.url === '/guestBook.html') return serveGuestPage;
  if (req.method === 'POST' && req.url === '/addComment') return saveCommentAndRedirect;
  if (req.method === 'GET') return serveStaticPage;
  return () => notFound;
};

exports.findHandler = findHandler;
