/**
 * @file vite.config.mjs
 * @description Vite configuration for bundling the Foundry VTT module
 * @path vite.config.mjs
 */

import { defineConfig } from 'vite';
import process from 'node:process';
import { resolve } from 'node:path';

import aliasEntries from './alias.config.mjs';

export default defineConfig({
  // Ensure Vite root is always the repo root
  root: process.cwd(),
  build: {
    lib: {
      entry: resolve(process.cwd(), 'src/main.mjs'),
      name: 'OverMyHead',
      fileName: 'main',
      formats: ['es'],
    },
    emptyOutDir: true,
    outDir: resolve(process.cwd(), 'dist'),
    rollupOptions: {
      external: [
        // Exclude test files
        /.*\.test\.(js|cjs|mjs|ts|cts|mts)$/,
        /.*\.unit\.test\.(js|cjs|mjs|ts|cts|mts)$/,
        /.*\.int\.test\.(js|cjs|mjs|ts|cts|mts)$/,
        /.*\.setup\.test\.(js|cjs|mjs|ts|cts|mts)$/,
      ],
      output: {
        // Ensure the output is ES module format for Foundry VTT
        format: 'es',
        entryFileNames: '[name].mjs',
      },
    },
    sourcemap: true,
    // Copy static assets
    copyPublicDir: false,
  },
  resolve: {
    alias: aliasEntries,
  },
  // Enable JSON loading
  json: {
    stringify: 'auto',
  },
});
