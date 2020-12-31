module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  moduleFileExtensions: [
    'js',
    'json',
  ],
  testEnvironment: 'node',
  testMatch: [
    '**/*.test.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
};
