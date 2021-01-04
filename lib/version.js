const { version } = require('../package.json');

function surangVersion() {
  return version.split('.')[0];
}

function configVersion() {
  return '0';
}

module.exports = {
  surangVersion,
  configVersion,
};
