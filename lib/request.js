const pickupParams = function(query, keyValuePair) {
  const [key, value] = keyValuePair.split('=');
  query[key] = value;
  return query;
};

const readParams = keyValueTextPair => keyValueTextPair.split('&').reduce(pickupParams, {});

const reducer = (query, keyValue) => {
  const [key, value] = keyValue.split('=');
  query[key] = value;
  return query;
};

const readQueryText = function(queryText) {
  const query = queryText.split('&').reduce(reducer, {});
  return query;
};

const parseQueryParams = function(entireUrl) {
  const [url, queryText] = entireUrl.split('?');
  const query = queryText && readQueryText(queryText);
  return { url, query };
};

const collectHeadersAndBody = function(result, line) {
  if (line == '') {
    result.body = '';
    return result;
  }
  if ('body' in result) {
    result.body += line;
    return result;
  }
  const [key, value] = line.split(': ');
  result.headers[key] = value;
  return result;
};

class Request {
  constructor({ method, url, query, headers, body }) {
    this.method = method;
    this.url = url;
    this.query = query;
    this.headers = headers;
    this.body = body;
  }
  static parse(req) {
    const [requestLine, ...headersAndBody] = req.split('\r\n');
    const [method, entireUrl, protocol] = requestLine.split(' ');
    const { url, query } = parseQueryParams(entireUrl);
    let { headers, body } = headersAndBody.reduce(collectHeadersAndBody, { headers: {} });
    if ((headers['Content-Type'] = 'application / x - www - form - urlencoded')) {
      body = readParams(body);
    }
    const request = new Request({ method, url, query, headers, body });
    return request;
  }
}

module.exports = Request;
