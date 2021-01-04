/**
 * Represents a connection checking utility that keeps checking if connection is alive.
 * @class Heart
 */
class Heart {
  /**
   * Creates a Heart utility for given WebSocket server with provided interval.
   * @param {Object} connection - websocket client instance.
   * @param {number} interval - interval in ms in which server sends pings.
   */
  constructor(connection, interval) {
    this.connection = connection;
    this.interval = interval;
    this.latency = 3000;
  }

  /**
   * Beats the heart and hence keeps it alive for few more milliseconds.
   * @function beat
   */
  beat() {
    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(() => {
      this.connection.terminate();
    }, this.interval + this.latency);
  }

  /**
   * Intentionally ends the heart beat and hence dies.
   * @function die
   */
  die() {
    clearTimeout(this.pingTimeout);
  }
}

module.exports = Heart;
