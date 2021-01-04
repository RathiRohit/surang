const EventEmitter = require('events');

const mockErrorResponse = (reason) => ({
  on: (event, cb) => {
    if (event === 'data') {
      cb(reason.slice(0, reason.length / 2));
      cb(reason.slice(reason.length / 2));
    } else if (event === 'end') {
      cb();
    }
  },
});

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
  emitUnexpectedResponse: (reason) => WebSocket.mock.instance.emit(
    'unexpected-response',
    {},
    mockErrorResponse(reason),
  ),
};

module.exports = WebSocket;
