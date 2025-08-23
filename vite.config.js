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
      entry: resolve(process.cwd(), 'src/main.js'),
      name: 'OverMyHead',
      fileName: 'main',
      formats: ['es']
    },
    emptyOutDir: true,
    outDir: resolve(process.cwd(), 'dist'),
    rollupOptions: {
      external: [
        // Exclude test files
        /.*\.test\.js$/,
        /.*\.unit\.test\.js$/,
        /.*\.int\.test\.js$/,
        /.*\.setup\.test\.js$/
      ],
      output: {
        // Ensure the output is ES module format for Foundry VTT
        format: 'es',
        entryFileNames: '[name].js'
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
      '@config': resolve(process.cwd(), 'src/config/config.js'),
      '@constants': resolve(process.cwd(), 'src/config/constants.js'),
      '@manifest': resolve(process.cwd(), 'src/config/manifest.js'),
      '@configFolder': resolve(process.cwd(), 'src/config'),
      '@contexts': resolve(process.cwd(), 'src/contexts'),
      '@data': resolve(process.cwd(), 'src/data'),
      '@handlers': resolve(process.cwd(), 'src/handlers'),
      '@utils': resolve(process.cwd(), 'src/utils'),
      '@listeners': resolve(process.cwd(), 'src/listeners'),
      '@maps': resolve(process.cwd(), 'src/maps'),
      '@helpers': resolve(process.cwd(), 'src/helpers'),
      '@configHelpers': resolve(process.cwd(), 'src/config/helpers'),
      '@validator': resolve(process.cwd(), 'src/utils/static/validator.js'),
      '@module': resolve(process.cwd(), 'module.json')
    }
  },
  // Enable JSON loading
  json: {
    stringify: false
  }
});