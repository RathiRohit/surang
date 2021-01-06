const transform = require('./transformer');

const serverMessage = {
  method: 'POST',
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
    forEach: (cb) => cb('TEST_COOKIE_HEADER', 'set-cookie'),
  },
  text: () => Promise.resolve({
    testKey1: 'testValue1',
    testKey2: 2,
  }),
};

describe('toRequest', () => {
  it('should transform server message to node-fetch request object', () => {
    expect(transform.toRequest(serverMessage, 'testHost')).toEqual({
      method: 'POST',
      headers: {
        authorization: 'bearer some-random-token',
        host: 'testHost',
        'accept-encoding': 'identity',
      },
      body: '{"testKey1":"testValue1","testKey2":2}',
      cookies: {
        testCookie: 'someTestCookie',
      },
    });
  });

  it('should transform server message without headers', () => {
    const serverMessageWithoutHeaders = {
      ...serverMessage,
      headers: undefined,
    };

    expect(transform.toRequest(serverMessageWithoutHeaders, 'testHost')).toEqual({
      method: 'POST',
      headers: {
        host: 'testHost',
        'accept-encoding': 'identity',
      },
      body: '{"testKey1":"testValue1","testKey2":2}',
      cookies: {
        testCookie: 'someTestCookie',
      },
    });
  });
});

describe('toMessage', () => {
  it('should transform response to message object', async () => {
    const message = await transform.toMessage(response);

    expect(message).toEqual({
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
    });
  });
});
