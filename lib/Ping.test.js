const WebSocket = require('ws');
const Ping = require('./Ping');

const TEST_INTERVAL = 45000;

describe('Ping', () => {
  let ping;
  let ws;

  beforeEach(() => {
    jest.useFakeTimers();
    ping = new Ping(TEST_INTERVAL);
    ws = new WebSocket('wss://surang.example.com');
  });

  describe('start', () => {
    it('should start sending repeated pings on given connection', () => {
      expect(ws.send).toHaveBeenCalledTimes(0);

      ping.start(ws);

      jest.advanceTimersByTime(TEST_INTERVAL);
      expect(ws.send).toHaveBeenCalledTimes(1);
      expect(ws.send).toHaveBeenCalledWith('{"ping":true}');

      jest.advanceTimersByTime(TEST_INTERVAL);
      expect(ws.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('stop', () => {
    it('should stop sending repeated pings', () => {
      expect(ws.send).toHaveBeenCalledTimes(0);
      ping.start(ws);
      jest.advanceTimersByTime(TEST_INTERVAL);
      expect(ws.send).toHaveBeenCalledTimes(1);

      ping.stop();

      jest.advanceTimersByTime(TEST_INTERVAL);
      expect(ws.send).toHaveBeenCalledTimes(1);
    });
  });
});
