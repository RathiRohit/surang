jest.unmock('fs-extra');
jest.unmock('inquirer');
jest.unmock('node-fetch');
jest.unmock('os');
jest.unmock('ws');

jest.setTimeout(60000);

const fetch = jest.requireActual('node-fetch');

const TestServer = require('./TestServer');
const Surang = require('../surang');

const SURANG_SERVER_AUTH_KEY = 'something-secret';
const SURANG_SERVER_PORT = 7000;
const TEST_SERVER_PORT = 3000;

function getHeaders(response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value.toLowerCase();
  });
  return headers;
}

describe('surang tunnel', () => {
  let surang;
  let testServer;

  beforeEach(async () => {
    testServer = new TestServer();
    await testServer.start(TEST_SERVER_PORT);

    surang = new Surang(TEST_SERVER_PORT, {
      server: `localhost:${SURANG_SERVER_PORT}`,
      authKey: SURANG_SERVER_AUTH_KEY,
      secure: false,
    });

    await new Promise((resolve) => {
      surang.once('connect', () => {
        resolve();
      });
      surang.connect();
    });
  });

  afterEach(() => {
    surang.disconnect();
    testServer.stop();
  });

  it('should forward GET request and give back correct HTML response', async () => {
    const request = {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        'user-agent': 'test-user-agent',
      },
      cookies: {
        TEST_COOKIE: 'test-cookie',
      },
    };

    const surangResponse = await fetch(`http://localhost:${SURANG_SERVER_PORT}/get-html`, request);
    const normalResponse = await fetch(`http://localhost:${TEST_SERVER_PORT}/get-html`, request);

    expect(surangResponse.status).toBe(200);
    expect(surangResponse.status).toBe(normalResponse.status);
    expect(surangResponse.statusText).toBe('OK');
    expect(surangResponse.statusText).toBe(normalResponse.statusText);
    expect(getHeaders(surangResponse)['content-type']).toBe('text/html; charset=utf-8');
    expect(getHeaders(surangResponse)).toEqual(getHeaders(normalResponse));
    expect(await surangResponse.text()).toEqual(await normalResponse.text());
  });
});
