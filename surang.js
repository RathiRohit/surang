const EventEmitter = require('events');
const fetch = require('node-fetch');
const WebSocket = require('ws');
const transform = require('./lib/transformer');
const Heart = require('./lib/Heart');
const { surangVersion } = require('./lib/version');

const HEART_BEAT_INTERVAL = 45000;

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
    if (this.heart) {
      this.heart.die();
    }

    this.connection = new WebSocket(this.wsURL, [], {
      headers: {
        authorization: this.authKey,
        'x-surang-version': surangVersion(),
      },
    });
    this.heart = new Heart(this.connection, HEART_BEAT_INTERVAL);

    this.connection.on('open', () => {
      this.heart.beat();
      this.emit('connect', this.basePath);
    });

    this.connection.on('ping', () => {
      this.heart.beat();
    });

    this.connection.on('message', async (data) => {
      const message = JSON.parse(data);
      this.emit('incoming', {
        method: message.method,
        url: message.url,
      });

      try {
        const response = await fetch(
          this.localServer + message.url,
          transform.toRequest(message, this.hostHeader),
        );
        const responseMessage = await transform.toMessage(response);
        this.connection.send(JSON.stringify({
          ...responseMessage,
          reqID: message.reqID,
        }));
      } catch (e) {
        this.emit('error', e);
      }
    });

    this.connection.on('close', () => {
      this.heart.die();
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
