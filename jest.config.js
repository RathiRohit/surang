module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__mocks__/**',
    '!**/__integration__/**',
    '!**/bin/**',
    '!.eslintrc.js',
    '!jest.config.js',
  ],
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: [
    'js',
    'json',
  ],
  testEnvironment: 'node',
  testMatch: [
    '**/*.test.js',
    '!**/integration.test.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  modulePaths: ['<rootDir>'],
};
