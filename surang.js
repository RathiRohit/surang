const EventEmitter = require('events');
const fetch = require('node-fetch');
const WebSocket = require('ws');
const transform = require('./lib/transformer');

class Surang extends EventEmitter {
  constructor(options) {
    super();

    this.authKey = options.authKey;
    this.localPort = options.port;
    this.server = options.server;

    this.wsURL = `wss://${this.server}`;
    this.basePath = `https://${this.server}`;
    this.hostHeader = `localhost:${this.localPort}`;
    this.localServer = `http://localhost:${this.localPort}`;
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

    this.connection.on('close', (_code, reason) => {
      this.emit('disconnect', reason);
    });

    this.connection.on('error', (error) => {
      this.emit('error', error);
    });
  }
}

module.exports = Surang;
