const { version } = require('../package.json');
const { surangVersion, configVersion } = require('./version');

describe('surangVersion', () => {
  it('should be current package.json major version', () => {
    expect(surangVersion()).toBe(version.split('.')[0]);
  });
});

describe('configVersion', () => {
  it('should be "0"', () => {
    expect(configVersion()).toBe('0');
  });
});
