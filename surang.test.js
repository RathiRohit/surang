const WebSocket = require('ws');
const fetch = require('node-fetch');
const Surang = require('./surang');
const transform = require('./lib/transformer');

const incomingRequest = {
  method: 'POST',
  url: '/test/request/goes?where=here',
  headers: {
    authorization: 'bearer some-random-token',
    host: 'surang.example.com',
  },
  body: {
    testKey1: 'testValue1',
    testKey2: 2,
  },
  cookies: {
    testCookie: 'someTestCookie',
  },
};

const response = {
  status: 200,
  statusText: 'SUCCESS',
  type: 'application/json',
  headers: {
    'set-cookie': 'TEST_COOKIE_HEADER',
  },
  body: {
    testKey1: 'testValue1',
    testKey2: 2,
  },
};

describe('Surang', () => {
  const wsMock = WebSocket.mock;
  let surangClient;

  beforeEach(async () => {
    wsMock.clear();
    surangClient = new Surang({
      authKey: 'TEST_AUTH_KEY',
      port: 8000,
      server: 'surang.example.com',
    });
  });

  it('should emit "connect" event on successful connection', (done) => {
    surangClient.on('connect', (url) => {
      expect(url).toBe('https://surang.example.com');
      done();
    });

    surangClient.connect();
    wsMock.emitOpen();
  });

  it('should emit "disconnect" event on connection close', (done) => {
    surangClient.on('disconnect', (reason) => {
      expect(reason).toBe('TEST_REASON_FOR_DISCONNECTION');
      done();
    });

    surangClient.connect();
    wsMock.emitClose('TEST_REASON_FOR_DISCONNECTION');
  });

  it('should emit "error" event on error scenarios', (done) => {
    surangClient.on('error', (reason) => {
      expect(reason).toBe('TEST_ERROR_IN_CONNECTION');
      done();
    });

    surangClient.connect();
    wsMock.emitError('TEST_ERROR_IN_CONNECTION');
  });

  it('should emit "incoming" event on receiving request', (done) => {
    surangClient.on('incoming', (request) => {
      expect(request).toEqual({
        method: 'POST',
        url: '/test/request/goes?where=here',
      });
      done();
    });

    surangClient.connect();
    wsMock.emitMessage(JSON.stringify(incomingRequest));
  });

  it('should forward incoming request to local server', (done) => {
    surangClient.on('incoming', () => {
      setTimeout(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/test/request/goes?where=here',
          transform.toRequest(incomingRequest, 'localhost:8000'),
        );
        done();
      }, 0);
    });

    surangClient.connect();
    wsMock.emitMessage(JSON.stringify(incomingRequest));
  });

  it('should send local server response back through tunnel', (done) => {
    surangClient.on('incoming', () => {
      setTimeout(() => {
        expect(wsMock.instance.send).toHaveBeenCalledTimes(1);
        expect(wsMock.instance.send).toHaveBeenCalledWith(JSON.stringify(response));
        done();
      }, 0);
    });

    surangClient.connect();
    wsMock.emitMessage(JSON.stringify(incomingRequest));
  });

  describe('connect', () => {
    it('should connect to ws server at given url with correct auth key', () => {
      surangClient.connect();

      expect(wsMock.instance.url).toBe('wss://surang.example.com');
      expect(wsMock.instance.protocols).toEqual([]);
      expect(wsMock.instance.options).toEqual({
        headers: { authorization: 'TEST_AUTH_KEY' },
      });
    });
  });
});
