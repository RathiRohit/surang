jest.mock('os');
jest.mock('inquirer');

const fse = require('fs-extra');
const inquirer = require('inquirer');
const config = require('./config');
const { version } = require('../package.json');

const expectedDefaultConfig = {
  version: version.split('.')[0],
  host: '',
  secure: true,
  verbose: true,
  'auth-key': '',
};

const storedConfig = {
  version: version.split('.')[0],
  host: 'surang.example.com',
  secure: true,
  verbose: false,
  'auth-key': 'some-secret-auth-key',
};

const newUserConfig = {
  host: 'new-surang.example.com',
  secure: false,
  verbose: true,
  'auth-key': 'some-other-secret-auth-key',
};

const inquiryPrompt = [
  {
    type: 'input',
    name: 'host',
    message: 'What\'s your surang-server address (without protocol, ex: "surang.example.com")?',
    default: storedConfig.host,
  },
  {
    type: 'confirm',
    name: 'secure',
    message: 'Does the surang-server address support HTTPS?',
    default: storedConfig.secure,
  },
  {
    type: 'confirm',
    name: 'verbose',
    message: 'Do you want to enable logging of incoming requests?',
    default: storedConfig.verbose,
  },
  {
    type: 'input',
    name: 'auth-key',
    message: 'Enter the auth key to be used for authenticating to server:',
    default: storedConfig['auth-key'],
  },
];

describe('get', () => {
  it('should give default config in case of read error', () => {
    expect(fse.readJsonSync).toHaveBeenCalledTimes(0);
    expect(fse.outputJsonSync).toHaveBeenCalledTimes(0);
    fse.readJsonSync.mockImplementationOnce(() => {
      throw new Error('File not found.');
    });

    const currentConfig = config.get();

    expect(currentConfig).toEqual(expectedDefaultConfig);
    expect(fse.readJsonSync).toHaveBeenCalledTimes(1);
    expect(fse.readJsonSync).toHaveBeenCalledWith('/test/home/dir/Surang/config.json');
    expect(fse.outputJsonSync).toHaveBeenCalledTimes(1);
    expect(fse.outputJsonSync).toHaveBeenCalledWith(
      '/test/home/dir/Surang/config.json',
      expectedDefaultConfig,
    );
  });

  it('should give default config in case of version mismatch', () => {
    expect(fse.outputJsonSync).toHaveBeenCalledTimes(0);
    fse.readJsonSync.mockReturnValueOnce({
      ...storedConfig,
      version: '-1',
    });

    const currentConfig = config.get();

    expect(currentConfig).toEqual(expectedDefaultConfig);
    expect(fse.outputJsonSync).toHaveBeenCalledTimes(1);
    expect(fse.outputJsonSync).toHaveBeenCalledWith(
      '/test/home/dir/Surang/config.json',
      expectedDefaultConfig,
    );
  });

  it('should give stored config in case of no errors', () => {
    fse.readJsonSync.mockReturnValueOnce(storedConfig);

    const currentConfig = config.get();

    expect(currentConfig).toEqual(storedConfig);
    expect(fse.outputJsonSync).toHaveBeenCalledTimes(0);
  });
});

describe('generate', () => {
  it('should generate inquiry and store new config', (done) => {
    fse.readJsonSync.mockReturnValueOnce(storedConfig);
    inquirer.prompt.mockResolvedValueOnce(newUserConfig);
    fse.outputJsonSync.mockImplementationOnce((path, data) => {
      expect(path).toBe('/test/home/dir/Surang/config.json');
      expect(data).toEqual({
        ...newUserConfig,
        version: storedConfig.version,
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
      expect(inquirer.prompt).toHaveBeenCalledWith(inquiryPrompt);
      done();
    });

    config.generate();
  });
});
