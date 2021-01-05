const fetch = jest.fn();

fetch.mockImplementation(() => Promise.resolve({
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
}));

module.exports = fetch;
