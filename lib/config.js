const os = require('os');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const { version } = require('../package.json');

const DEFAULT_CONFIG = {
  version: version.split('.')[0],
  host: '',
  secure: true,
  verbose: true,
  'auth-key': '',
};

const CONFIG_FILE_PATH = `${os.homedir()}/Surang/config.json`;

/**
 * Gets stored config from config file or default config.
 * @function get
 * @return {Object} - global config data.
 */
function get() {
  let currentConfig;
  try {
    currentConfig = fse.readJsonSync(CONFIG_FILE_PATH);
    if (currentConfig.version !== DEFAULT_CONFIG.version) {
      throw new Error('Config file version mismatch.');
    }
  } catch (e) {
    currentConfig = DEFAULT_CONFIG;
    fse.outputJsonSync(CONFIG_FILE_PATH, currentConfig);
  }
  return currentConfig;
}

/**
 * Prompts user with inquiry for new config and writes the new config to global file.
 * @function generate
 */
function generate() {
  const currentConfig = get();

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'host',
        message: 'What\'s your surang-server address (without protocol, ex: "surang.example.com")?',
        default: currentConfig.host,
      },
      {
        type: 'confirm',
        name: 'secure',
        message: 'Does the surang-server address support HTTPS?',
        default: currentConfig.secure,
      },
      {
        type: 'confirm',
        name: 'verbose',
        message: 'Do you want to enable logging of incoming requests?',
        default: currentConfig.verbose,
      },
      {
        type: 'input',
        name: 'auth-key',
        message: 'Enter the auth key to be used for authenticating to server:',
        default: currentConfig['auth-key'],
      },
    ])
    .then((newConfig) => {
      fse.outputJsonSync(CONFIG_FILE_PATH, {
        ...newConfig,
        version: DEFAULT_CONFIG.version,
      });
    });
}

module.exports = {
  get,
  generate,
};
