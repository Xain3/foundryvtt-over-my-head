#!/usr/bin/env node

/**
 * @file test-runner.mjs
 * @description Test runner for build and deployment scripts
 * @path .dev/scripts/testing/test-runner.mjs
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      cwd: projectRoot,
      ...options,
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
    colorLog(
      'cyan',
      `
Test Runner for Build and Deployment Scripts

Usage: node .dev/scripts/testing/test-runner.mjs [options]

Options:
  --unit              Run only unit tests
  --integration       Run only integration tests
  --performance       Run only performance tests
  --coverage          Run tests with coverage report
  --watch             Run tests in watch mode
  --help, -h          Show this help message

Examples:
  node .dev/scripts/testing/test-runner.mjs                    # Run all tests
  node .dev/scripts/testing/test-runner.mjs --unit             # Run only unit tests
  node .dev/scripts/testing/test-runner.mjs --coverage         # Run with coverage
  node .dev/scripts/testing/test-runner.mjs --unit --watch     # Run unit tests in watch mode
`
    );
    return;
  }

  try {
    colorLog(
      'bright',
      '🧪 Starting Test Suite for Build and Deployment Scripts'
    );
    console.log('');

    const vitestArgs = [];

    if (args.includes('--unit')) {
      vitestArgs.push(
        '--run',
        '--reporter=verbose',
        'tests/**/*.unit.test.mjs'
      );
      colorLog('blue', '📋 Running Unit Tests');
    } else if (args.includes('--integration')) {
      vitestArgs.push('--run', '--reporter=verbose', 'tests/**/*.int.test.mjs');
      colorLog('blue', '📋 Running Integration Tests');
    } else if (args.includes('--performance')) {
      vitestArgs.push(
        '--run',
        '--reporter=verbose',
        'tests/**/*.performance.test.mjs'
      );
      colorLog('blue', '📋 Running Performance Tests');
    } else {
      vitestArgs.push('--run', '--reporter=verbose');
      colorLog('blue', '📋 Running All Tests');
    }

    if (args.includes('--coverage')) {
      vitestArgs.push('--coverage');
      colorLog('yellow', '📊 Including Coverage Report');
    }

    if (args.includes('--watch')) {
      vitestArgs.splice(vitestArgs.indexOf('--run'), 1);
      vitestArgs.push('--watch');
      colorLog('yellow', '👀 Running in Watch Mode');
    }

    console.log('');
    colorLog('cyan', `Running: npx vitest ${vitestArgs.join(' ')}`);
    console.log('');

    await runCommand('npx', ['vitest', ...vitestArgs]);

    console.log('');
    colorLog('green', '✅ All tests completed successfully!');
  } catch (error) {
    console.log('');
    colorLog('red', '❌ Tests failed:');
    colorLog('red', error.message);
    process.exit(1);
  }
}

async function runTestsForFile(filePath) {
  colorLog('blue', `🎯 Running tests for: ${filePath}`);

  try {
    await runCommand('npx', ['vitest', 'run', '--reporter=verbose', filePath]);
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
    await runCommand('npx', [
      'eslint',
      '.dev/scripts/**/*.test.mjs',
      'tests/**/*.test.mjs',
    ]);
    colorLog('green', '✅ Linting completed successfully!');
  } catch (error) {
    colorLog('yellow', '⚠️  Linting issues found (continuing anyway)');
  }
}

export { runTests, runTestsForFile, lintTests };

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runTests();
}
