const colors = require('colors/safe');
const log = require('./logger');

describe('log', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('onSuccessfulConnection', () => {
    it('should log url with proper colors', () => {
      expect(consoleLogSpy).toHaveBeenCalledTimes(0);

      log.onSuccessfulConnection('https://surang.example.com');

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        'Connected to Surang server.',
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        2,
        `Public url: ${colors.brightGreen('https://surang.example.com')}\n`,
      );
    });
  });

  describe('onNewRequest', () => {
    it('should log request with proper colors', () => {
      expect(consoleLogSpy).toHaveBeenCalledTimes(0);

      log.onNewRequest({
        method: 'POST',
        url: '/test/request?param=23',
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `${colors.bgWhite.black(' POST ')} /test/request?param=23`,
      );
    });
  });

  describe('onDisconnection', () => {
    it('should log with proper colors when reason in undefined', () => {
      expect(consoleLogSpy).toHaveBeenCalledTimes(0);

      log.onDisconnection();

      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '=== connection closed ===');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, colors.brightRed('Error: Unknown error.'));
    });

    it('should log with proper colors when reason in empty', () => {
      expect(consoleLogSpy).toHaveBeenCalledTimes(0);

      log.onDisconnection('');

      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '=== connection closed ===');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, colors.brightRed('Error: Unknown error.'));
    });

    it('should log reason with proper colors', () => {
      expect(consoleLogSpy).toHaveBeenCalledTimes(0);

      log.onDisconnection('Some test error.');

      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '=== connection closed ===');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, colors.brightRed('Error: Some test error.'));
    });
  });

  describe('onError', () => {
    it('should log error', () => {
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);

      log.onError('Some test error.');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Some test error.');
    });
  });
});
