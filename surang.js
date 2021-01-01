const EventEmitter = require('events');
const WebSocket = require('ws');

class Surang extends EventEmitter {
  constructor(options) {
    super();

    this.authKey = options.authKey;
    this.localPort = options.port;
    this.server = options.server;

    this.wsURL = `wss://${this.server}`;
    this.basePath = `https://${this.server}`;
    this.localServer = `http://localhost:${this.localPort}`;
  }

  connect() {
    this.connection = new WebSocket(this.wsURL, [], {
      headers: { authorization: this.authKey },
    });

    this.connection.on('open', () => {
      this.emit('connect', this.basePath);
    });

    this.connection.on('message', (data) => {
      const request = JSON.parse(data);
      this.emit('incoming', {
        method: request.method,
        url: request.url,
      });
    });

    this.connection.on('close', (_code, reason) => {
      this.emit('disconnect', reason);
    });

    this.connection.on('error', (error) => {
      this.emit('error', error);
    });
  }
}

module.exports = Surang;
