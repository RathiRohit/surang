const EventEmitter = require('events');
const fetch = require('node-fetch');
const WebSocket = require('ws');
const transform = require('./lib/transformer');

class Surang extends EventEmitter {
  constructor(port, options) {
    super();

    this.localPort = port;
    this.server = options.server;
    this.authKey = options.authKey;

    this.hostHeader = `localhost:${this.localPort}`;
    this.localServer = `http://localhost:${this.localPort}`;
    this.wsURL = `ws${options.secure ? 's' : ''}://${this.server}`;
    this.basePath = `http${options.secure ? 's' : ''}://${this.server}`;
  }

  connect() {
    this.connection = new WebSocket(this.wsURL, [], {
      headers: { authorization: this.authKey },
    });

    this.connection.on('open', () => {
      this.emit('connect', this.basePath);
    });

    this.connection.on('message', async (data) => {
      const message = JSON.parse(data);
      this.emit('incoming', {
        method: message.method,
        url: message.url,
      });

      const response = await fetch(
        this.localServer + message.url,
        transform.toRequest(message, this.hostHeader),
      );
      const responseMessage = await transform.toMessage(response);
      this.connection.send(JSON.stringify(responseMessage));
    });

    this.connection.on('close', () => {
      this.emit('disconnect');
    });

    this.connection.on('unexpected-response', (_req, res) => {
      this.emit('reject', res.headers['x-error']);
    });

    this.connection.on('error', (error) => {
      this.emit('error', error);
    });
  }

  disconnect() {
    if (this.connection) {
      this.connection.terminate();
    }
  }
}

module.exports = Surang;
