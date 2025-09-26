/**
 * @file vite.config.mjs
 * @description Vite configuration for bundling the Foundry VTT module
 * @path vite.config.mjs
 */

import { defineConfig } from 'vite';
import process from 'node:process';
import { resolve } from 'node:path';

export default defineConfig({
  // Ensure Vite root is always the repo root
  root: process.cwd(),
  build: {
    lib: {
      entry: resolve(process.cwd(), 'src/main.mjs'),
      name: 'OverMyHead',
      fileName: 'main',
      formats: ['es']
    },
    emptyOutDir: true,
    outDir: resolve(process.cwd(), 'dist'),
    rollupOptions: {
      external: [
        // Exclude test files
        /.*\.test\.mjs$/,
        /.*\.unit\.test\.mjs$/,
        /.*\.int\.test\.mjs$/,
        /.*\.setup\.test\.mjs$/
      ],
      output: {
        // Ensure the output is ES module format for Foundry VTT
        format: 'es',
        entryFileNames: '[name].mjs'
      }
    },
    minify: false,
    sourcemap: true,
    // Copy static assets
    copyPublicDir: false
  },
  resolve: {
        alias: [
      { find: '@', replacement: resolve(process.cwd(), 'src') },
      { find: '@docker', replacement: resolve(process.cwd(), 'docker') },
      { find: '@baseClasses', replacement: resolve(process.cwd(), 'src/baseClasses') },
      { find: '@config', replacement: resolve(process.cwd(), 'src/config/config.mjs') },
      { find: '@constants', replacement: resolve(process.cwd(), 'src/config/constants.mjs') },
      { find: '@manifest', replacement: resolve(process.cwd(), 'src/config/manifest.mjs') },
      { find: '@configFolder', replacement: resolve(process.cwd(), 'src/config') },
      { find: '@contexts', replacement: resolve(process.cwd(), 'src/contexts') },
      { find: '@data', replacement: resolve(process.cwd(), 'src/data') },
      { find: '@handlers', replacement: resolve(process.cwd(), 'src/handlers') },
      { find: '@utils', replacement: resolve(process.cwd(), 'src/utils') },
      { find: '@listeners', replacement: resolve(process.cwd(), 'src/listeners') },
      { find: '@maps', replacement: resolve(process.cwd(), 'src/maps') },
      { find: '@helpers', replacement: resolve(process.cwd(), 'src/helpers') },
      { find: '@configHelpers', replacement: resolve(process.cwd(), 'src/config/helpers') },
      { find: '@validator', replacement: resolve(process.cwd(), 'src/utils/static/validator.mjs') },
      { find: '@integrationTests', replacement: resolve(process.cwd(), 'tests/integration') },
      { find: '@mocks', replacement: resolve(process.cwd(), 'tests/mocks') },
      { find: '@module', replacement: resolve(process.cwd(), 'module.json') }
    ]
  },
  // Enable JSON loading
  json: {
    stringify: false
  }
});