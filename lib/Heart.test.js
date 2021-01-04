const WebSocket = require('ws');
const Heart = require('./Heart');

const TEST_HEART_BEAT_INTERVAL = 30000;

describe('Heart', () => {
  let connection;
  let heart;

  beforeEach(() => {
    jest.useFakeTimers();
    connection = new WebSocket('wss://surang.example.com');
    heart = new Heart(connection, TEST_HEART_BEAT_INTERVAL);
    WebSocket.mock.instance.terminate.mockClear();
  });

  afterEach(() => {
    heart.die();
  });

  it('should not terminate the connection if heart is beating', () => {
    heart.beat();
    jest.advanceTimersByTime(heart.latency);
    expect(WebSocket.mock.instance.terminate).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(TEST_HEART_BEAT_INTERVAL - 1);
    heart.beat();
    jest.advanceTimersByTime(heart.latency);
    expect(WebSocket.mock.instance.terminate).toHaveBeenCalledTimes(0);
  });

  it('should terminate the connection if heart is not beating', () => {
    heart.beat();
    jest.advanceTimersByTime(heart.latency);
    expect(WebSocket.mock.instance.terminate).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(TEST_HEART_BEAT_INTERVAL + 1);
    expect(WebSocket.mock.instance.terminate).toHaveBeenCalledTimes(1);
  });

  it('should stop everything when died', () => {
    heart.beat();
    jest.advanceTimersByTime(heart.latency);
    expect(WebSocket.mock.instance.terminate).toHaveBeenCalledTimes(0);

    heart.die();
    jest.advanceTimersByTime(TEST_HEART_BEAT_INTERVAL + 1);
    expect(WebSocket.mock.instance.terminate).toHaveBeenCalledTimes(0);
  });
});
