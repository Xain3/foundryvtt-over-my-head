/**
 * @file vite.config.js
 * @description Vite configuration for bundling the Foundry VTT module
 * @path vite.config.js
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

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
    alias: {
      '@': resolve(process.cwd(), 'src'),
  '@docker': resolve(process.cwd(), 'docker'),
      '@config': resolve(process.cwd(), 'src/config/config.mjs'),
      '@constants': resolve(process.cwd(), 'src/config/constants.mjs'),
      '@manifest': resolve(process.cwd(), 'src/config/manifest.mjs'),
      '@configFolder': resolve(process.cwd(), 'src/config'),
      '@contexts': resolve(process.cwd(), 'src/contexts'),
      '@data': resolve(process.cwd(), 'src/data'),
      '@handlers': resolve(process.cwd(), 'src/handlers'),
      '@utils': resolve(process.cwd(), 'src/utils'),
      '@listeners': resolve(process.cwd(), 'src/listeners'),
      '@maps': resolve(process.cwd(), 'src/maps'),
      '@helpers': resolve(process.cwd(), 'src/helpers'),
      '@configHelpers': resolve(process.cwd(), 'src/config/helpers'),
      '@validator': resolve(process.cwd(), 'src/utils/static/validator.mjs'),
      '@module': resolve(process.cwd(), 'module.json')
    }
  },
  // Enable JSON loading
  json: {
    stringify: false
  }
});