const request = require('supertest');
const { app } = require('../lib/handlers');
const sinon = require('sinon');
const fs = require('fs');

describe('GET', function() {
  describe('URL: /', function() {
    it('should give status code 200', function(done) {
      request(app.serve.bind(app))
        .get('/')
        .set('Accept', '*/*')
        .expect('Content-Type', 'text/html')
        .expect('Content-Length', '880')
        .expect(200, done);
    });
  });

  describe('URL: /bad', function() {
    it('should give status code notFound', function(done) {
      request(app.serve.bind(app))
        .get('/bad')
        .set('Accept', '*/*')
        .expect(404, done);
    });
  });

  describe('URL: /guestBook.html', function() {
    it('should give status code 200', function(done) {
      request(app.serve.bind(app))
        .get('/guestBook.html')
        .expect('Content-Type', 'text/html')
        .expect(200, done);
    });
  });

  describe('URL: /index.html', function() {
    it('should give status code 200', function(done) {
      request(app.serve.bind(app))
        .get('/index.html')
        .expect('Content-Type', 'text/html')
        .expect('Content-Length', '880')
        .expect(200, done);
    });
  });

  describe('URL: /Ageratum.html', function() {
    it('should give status code 200', function(done) {
      request(app.serve.bind(app))
        .get('/Ageratum.html')
        .expect('Content-Type', 'text/html')
        .expect('Content-Length', '1299')
        .expect(200, done);
    });
  });

  describe('URL: /abeliophyllum.html', function() {
    it('should give status code 200', function(done) {
      request(app.serve.bind(app))
        .get('/Ageratum.html')
        .expect('Content-Type', 'text/html')
        .expect('Content-Length', '1299')
        .expect(200, done);
    });
  });
});

describe('POST', function() {
  describe('URL: /guestBook.html', function() {
    before(() => sinon.replace(fs, 'writeFileSync', sinon.fake()));
    after(() => sinon.restore());

    it('should give status code 200', function(done) {
      request(app.serve.bind(app))
        .post('/guestBook.html')
        .send('hello everyone')
        .expect(303, done);
    });
  });
});
