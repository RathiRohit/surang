/* eslint-disable no-console */

const colors = require('colors/safe');

function onSuccessfulConnection(url) {
  console.log('Connected to Surang server.');
  console.log(`Public url: ${colors.brightGreen(url)}\n`);
}

function onNewRequest({ method, url }) {
  console.log(`${colors.bgWhite.black(` ${method} `)} ${url}`);
}

function onDisconnection(reason) {
  const errorMsg = (reason && reason !== '') ? reason : 'Unknown error.';
  console.log('=== connection closed ===');
  console.log(colors.brightRed(`Error: ${errorMsg}`));
}

function onError(e) {
  console.error(e);
}

module.exports = {
  onSuccessfulConnection,
  onNewRequest,
  onDisconnection,
  onError,
};
