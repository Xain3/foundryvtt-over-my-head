const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname),
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  roots: ['<rootDir>/src', '<rootDir>/tests']
};