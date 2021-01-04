const EventEmitter = require('events');

class WebSocket extends EventEmitter {
  constructor(url, protocols, options) {
    super();

    this.url = url;
    this.protocols = protocols;
    this.options = options;

    this.send = jest.fn();
    this.terminate = jest.fn();
    WebSocket.mock.instance = this;
  }
}

WebSocket.mock = {
  instance: null,
  clear: () => {
    WebSocket.mock.instance = null;
  },
  emitOpen: () => WebSocket.mock.instance.emit('open'),
  emitPing: () => WebSocket.mock.instance.emit('ping'),
  emitMessage: (testRequestMsg) => WebSocket.mock.instance.emit('message', testRequestMsg),
  emitClose: () => WebSocket.mock.instance.emit('close'),
  emitError: (testError) => WebSocket.mock.instance.emit('error', testError),
  emitUnexpectedResponse: (reason) => WebSocket.mock.instance.emit('unexpected-response', {}, {
    headers: { 'x-error': reason },
  }),
};

module.exports = WebSocket;
