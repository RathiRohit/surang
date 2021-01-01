/**
 * Represents a pinging utility used for keeping WebSocket connection alive.
 * @class Ping
 */
class Ping {
  /**
   * Creates a Ping utility with given interval.
   * @param {number} interval - interval in ms for repeating pings.
   */
  constructor(interval) {
    this.interval = interval;
  }

  /**
   * Starts pinging on given WebSocket connection; also stops ongoing pings if any.
   * @function start
   * @param {WebSocket} connection - instance of WebSocket class to star pinging on.
   */
  start(connection) {
    this.stop();
    this.timerID = setInterval(() => {
      connection.send('{"ping":true}');
    }, this.interval);
  }

  /**
   * Stops pinging on the WebSocket connection.
   * @function stop
   */
  stop() {
    clearInterval(this.timerID);
    this.timerID = null;
  }
}

module.exports = Ping;
