class Heart {
  constructor(connection, interval) {
    this.connection = connection;
    this.interval = interval;

    this.beat = jest.fn();
    this.die = jest.fn();
    Heart.mockInstance = this;
  }
}

module.exports = Heart;
