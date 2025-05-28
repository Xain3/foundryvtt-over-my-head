const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname),
  testEnvironment: 'node',
  // Update testMatch to recognize different test types including setup tests
  testMatch: [
    '**/*.unit.test.js',
    '**/*.int.test.js',
    '**/*.setup.test.js'
  ],
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // Include project root for setup tests
  roots: ['<rootDir>/src', '<rootDir>/tests', '<rootDir>'],
  // Enforce minimum coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80, // Minimum 80% branch coverage
      functions: 85, // Minimum 85% function coverage
      lines: 90,     // Minimum 90% line coverage
      statements: 90 // Minimum 90% statement coverage
    }
    // You can also specify thresholds per file or directory pattern
    // './src/some/critical/module.js': {
    //   branches: 100,
    //   statements: 100,
    // },
  },
  // Ensure coverage is collected
  collectCoverage: true,
  // Specify directories/files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/index.js', // Example: Exclude index files if needed
    '!**/node_modules/**',
    // Exclude test files and manifest from coverage
    '!**/*.test.js',
    '!**/module.json',
  ],
  testSequencer: '@jest/test-sequencer', // Explicitly set the default
};