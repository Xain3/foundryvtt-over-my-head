#!/usr/bin/env node

/**
 * @file test-runner.js
 * @description Test runner for build and deployment scripts
 * @path scripts/test-runner.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      cwd: projectRoot,
      ...options
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function runTests() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    colorLog('cyan', `
Test Runner for Build and Deployment Scripts

Usage: node test-runner.js [options]

Options:
  --unit              Run only unit tests
  --integration       Run only integration tests  
  --performance       Run only performance tests
  --coverage          Run tests with coverage report
  --watch             Run tests in watch mode
  --help, -h          Show this help message

Examples:
  node test-runner.js                    # Run all tests
  node test-runner.js --unit             # Run only unit tests
  node test-runner.js --coverage         # Run with coverage
  node test-runner.js --unit --watch     # Run unit tests in watch mode
`);
    return;
  }

  try {
    colorLog('bright', '🧪 Starting Test Suite for Build and Deployment Scripts');
    console.log('');

    const jestArgs = [];
    
    // Determine which tests to run
    if (args.includes('--unit')) {
      jestArgs.push('--testMatch', '**/*.unit.test.js');
      colorLog('blue', '📋 Running Unit Tests');
    } else if (args.includes('--integration')) {
      jestArgs.push('--testMatch', '**/*.int.test.js');
      colorLog('blue', '📋 Running Integration Tests');
    } else if (args.includes('--performance')) {
      jestArgs.push('--testMatch', '**/*.performance.test.js');
      colorLog('blue', '📋 Running Performance Tests');
    } else {
      colorLog('blue', '📋 Running All Tests');
    }

    // Add coverage if requested
    if (args.includes('--coverage')) {
      jestArgs.push('--coverage');
      colorLog('yellow', '📊 Including Coverage Report');
    }

    // Add watch mode if requested
    if (args.includes('--watch')) {
      jestArgs.push('--watch');
      colorLog('yellow', '👀 Running in Watch Mode');
    }

    // Add verbose output for detailed results
    jestArgs.push('--verbose');

    console.log('');
    colorLog('cyan', `Running: npx jest ${jestArgs.join(' ')}`);
    console.log('');

    await runCommand('npx', ['jest', ...jestArgs]);

    console.log('');
    colorLog('green', '✅ All tests completed successfully!');

  } catch (error) {
    console.log('');
    colorLog('red', '❌ Tests failed:');
    colorLog('red', error.message);
    process.exit(1);
  }
}

// Additional utility functions for specific test scenarios
async function runTestsForFile(filePath) {
  colorLog('blue', `🎯 Running tests for: ${filePath}`);
  
  try {
    await runCommand('npx', ['jest', filePath, '--verbose']);
    colorLog('green', '✅ File tests completed successfully!');
  } catch (error) {
    colorLog('red', `❌ Tests failed for ${filePath}:`);
    colorLog('red', error.message);
    process.exit(1);
  }
}

async function lintTests() {
  colorLog('blue', '🔍 Linting test files...');
  
  try {
    await runCommand('npx', ['eslint', 'scripts/**/*.test.js', 'tests/**/*.test.js']);
    colorLog('green', '✅ Linting completed successfully!');
  } catch (error) {
    colorLog('yellow', '⚠️  Linting issues found (continuing anyway)');
  }
}

// Export functions for use in other scripts
export { runTests, runTestsForFile, lintTests };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
