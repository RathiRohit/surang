const fetch = jest.fn();

fetch.mockImplementation(() => Promise.resolve({
  status: 200,
  statusText: 'SUCCESS',
  type: 'application/json',
  getHeaders: () => ({
    'set-cookie': 'TEST_COOKIE_HEADER',
  }),
  text: () => Promise.resolve({
    testKey1: 'testValue1',
    testKey2: 2,
  }),
}));

module.exports = fetch;
