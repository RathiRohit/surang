jest.mock('./lib/heart');

const WebSocket = require('ws');
const fetch = require('node-fetch');
const Surang = require('./surang');
const transform = require('./lib/transformer');
const Heart = require('./lib/Heart');

const incomingRequest = {
  reqID: 'some-random-uuid-comes-here',
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
  reqID: 'some-random-uuid-comes-here',
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

  beforeEach(() => {
    wsMock.clear();
    surangClient = new Surang(8000, {
      authKey: 'TEST_AUTH_KEY',
      server: 'surang.example.com',
      secure: true,
    });
    Heart.mockInstance?.beat.mockClear();
    Heart.mockInstance?.die.mockClear();
  });

  it('should emit "connect" event & beat on successful connection', (done) => {
    surangClient.on('connect', (url) => {
      expect(url).toBe('https://surang.example.com');
      expect(Heart.mockInstance.beat).toHaveBeenCalledTimes(1);
      done();
    });

    surangClient.connect();
    wsMock.emitOpen();
  });

  it('should emit "disconnect" event & die on connection close', () => {
    const emitSpy = jest.spyOn(surangClient, 'emit');

    surangClient.connect();
    wsMock.emitClose();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith('disconnect');
    expect(Heart.mockInstance.die).toHaveBeenCalledTimes(1);
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

  it('should emit "reject" event on rejection from server', (done) => {
    surangClient.on('reject', (reason) => {
      expect(reason).toBe('TEST_REASON_FOR_REJECTION');
      done();
    });

    surangClient.connect();
    wsMock.emitUnexpectedResponse('TEST_REASON_FOR_REJECTION');
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

  it('should emit "error" event on fetch error', (done) => {
    fetch.mockRejectedValueOnce('TEST_ERROR_IN_FETCH');
    surangClient.on('error', (reason) => {
      expect(reason).toBe('TEST_ERROR_IN_FETCH');
      done();
    });

    surangClient.connect();
    wsMock.emitMessage(JSON.stringify(incomingRequest));
  });

  it('should send local server response back through tunnel', (done) => {
    surangClient.on('incoming', () => {
      setTimeout(() => {
        expect(wsMock.instance.send).toHaveBeenCalledTimes(1);
        expect(JSON.parse(wsMock.instance.send.mock.calls[0][0])).toEqual(response);
        done();
      }, 0);
    });

    surangClient.connect();
    wsMock.emitMessage(JSON.stringify(incomingRequest));
  });

  it('should beat heart on ping from server', () => {
    surangClient.connect();
    wsMock.emitPing();

    expect(Heart.mockInstance.beat).toHaveBeenCalledTimes(1);
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

    it('should connect to ws server at given url when secure is false', () => {
      surangClient = new Surang(8000, {
        authKey: 'TEST_AUTH_KEY',
        server: 'surang.example.com',
        secure: false,
      });
      surangClient.connect();

      expect(wsMock.instance.url).toBe('ws://surang.example.com');
      expect(wsMock.instance.protocols).toEqual([]);
      expect(wsMock.instance.options).toEqual({
        headers: { authorization: 'TEST_AUTH_KEY' },
      });
    });

    it('should kill beating heart if any and create new', () => {
      surangClient = new Surang(8000, {
        authKey: 'TEST_AUTH_KEY',
        server: 'surang.example.com',
        secure: false,
      });
      surangClient.connect();
      expect(Heart.mockInstance).toBeDefined();
      const oldHeart = Heart.mockInstance;

      surangClient.disconnect();
      surangClient.connect();
      expect(Heart.mockInstance).not.toBe(oldHeart);
      expect(Heart.mockInstance.connection).toBe(surangClient.connection);
      expect(Heart.mockInstance.interval).toBe(45000);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from ws server', () => {
      surangClient.connect();

      surangClient.disconnect();

      expect(wsMock.instance.terminate).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if there no connection present', () => {
      surangClient.disconnect();

      expect(wsMock.instance).toBeNull();
    });
  });
});
