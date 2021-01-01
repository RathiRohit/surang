const EventEmitter = require('events');

class WebSocket extends EventEmitter {
  constructor(url, protocols, options) {
    super();

    this.url = url;
    this.protocols = protocols;
    this.options = options;

    this.send = jest.fn();
    WebSocket.mock.instance = this;
  }
}

WebSocket.mock = {
  instance: null,
  clear: () => {
    WebSocket.mock.instance = null;
  },
  emitOpen: () => WebSocket.mock.instance.emit('open'),
  emitMessage: (testRequestMsg) => WebSocket.mock.instance.emit('message', testRequestMsg),
  emitClose: (testReason) => WebSocket.mock.instance.emit('close', 1008, testReason),
  emitError: (testError) => WebSocket.mock.instance.emit('error', testError),
};

module.exports = WebSocket;
