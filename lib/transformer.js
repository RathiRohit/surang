/**
 * Transforms a server message object into node-fetch friendly request object.
 * @function toRequest
 * @param {Object} message - message object received from server.
 * @param {string} hostHeader - host header to be used in request.
 * @return {Object} - node-fetch friendly request object.
 */
function toRequest(message, hostHeader) {
  const headers = message.headers || {};
  return {
    method: message.method,
    headers: {
      ...headers,
      host: hostHeader,
    },
    body: message.body,
    cookies: message.cookies,
  };
}

/**
 * Transforms a node-fetch response into message object.
 * @function toMessage
 * @param {Object} response - response from node-fetch request.
 * @return {Promise<Object>} - promise that resolves to message object.
 */
async function toMessage(response) {
  return {
    status: response.status,
    statusText: response.statusText,
    type: response.type,
    headers: response.getHeaders(),
    body: await response.text(),
  };
}

module.exports = {
  toRequest,
  toMessage,
};
