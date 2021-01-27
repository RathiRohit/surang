jest.unmock('fs-extra');
jest.unmock('inquirer');
jest.unmock('node-fetch');
jest.unmock('os');
jest.unmock('ws');

jest.setTimeout(60000);

const fs = jest.requireActual('fs-extra');
const fetch = jest.requireActual('node-fetch');

const TestServer = require('./TestServer');
const Surang = require('../surang');

const getJsonResponse = require('./responses/get-json.json');

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

/*
* These tests are supposed to run on CI environment and assumes
* surang-server (with appropriate version) is running on test
* environment on 7000 port with 'something-secret' as auth key.
*/
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

  it('should forward GET request and give back correct JSON response', async () => {
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

    const surangResponse = await fetch(`http://localhost:${SURANG_SERVER_PORT}/get-json`, request);
    const jsonResponse = await surangResponse.json();
    const normalResponse = await fetch(`http://localhost:${TEST_SERVER_PORT}/get-json`, request);

    expect(surangResponse.status).toBe(200);
    expect(surangResponse.status).toBe(normalResponse.status);
    expect(surangResponse.statusText).toBe('OK');
    expect(surangResponse.statusText).toBe(normalResponse.statusText);
    expect(getHeaders(surangResponse)['content-type']).toBe('application/json; charset=utf-8');
    expect(getHeaders(surangResponse)).toEqual(getHeaders(normalResponse));
    expect(jsonResponse).toEqual(getJsonResponse);
    expect(jsonResponse).toEqual(await normalResponse.json());
  });

  it('should forward GET request and give back correct FILE response', async () => {
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

    const surangResponse = await fetch(`http://localhost:${SURANG_SERVER_PORT}/get-file`, request);
    const fileResponse = new Uint8Array(await surangResponse.arrayBuffer());
    const expectedFileResponse = new Uint8Array(fs.readFileSync('./responses/get-file.css', null).buffer);
    const normalResponse = await fetch(`http://localhost:${TEST_SERVER_PORT}/get-file`, request);

    expect(surangResponse.status).toBe(200);
    expect(surangResponse.status).toBe(normalResponse.status);
    expect(surangResponse.statusText).toBe('OK');
    expect(surangResponse.statusText).toBe(normalResponse.statusText);
    expect(getHeaders(surangResponse)['content-type']).toBe('text/css; charset=utf-8');
    expect(getHeaders(surangResponse)).toEqual(getHeaders(normalResponse));
    expect(fileResponse).toEqual(expectedFileResponse);
    expect(fileResponse).toEqual(new Uint8Array(await normalResponse.arrayBuffer()));
  });

  it('should forward POST request and give back correct EMPTY response', async () => {
    const request = {
      method: 'POST',
      headers: {
        'cache-control': 'no-cache',
        'user-agent': 'test-user-agent',
        'content-type': 'application/json',
      },
      cookies: {
        TEST_COOKIE: 'test-cookie',
      },
      body: JSON.stringify({ requestData: { isValid: true } }),
    };

    const surangResponse = await fetch(`http://localhost:${SURANG_SERVER_PORT}/post-empty`, request);
    const plainResponse = await surangResponse.text();
    const normalResponse = await fetch(`http://localhost:${TEST_SERVER_PORT}/post-empty`, request);

    expect(surangResponse.status).toBe(200);
    expect(surangResponse.status).toBe(normalResponse.status);
    expect(surangResponse.statusText).toBe('OK');
    expect(surangResponse.statusText).toBe(normalResponse.statusText);
    expect(getHeaders(surangResponse)['content-type']).toBe('text/plain; charset=utf-8');
    expect(getHeaders(surangResponse)).toEqual(getHeaders(normalResponse));
    expect(plainResponse).toEqual('OK');
    expect(plainResponse).toEqual(await normalResponse.text());
  });
});
