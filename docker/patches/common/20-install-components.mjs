/**
 * @file 20-install-components.mjs
 * @description Installs systems, modules, and worlds based on container-config, supporting manifest URLs and local paths with caching, retries, and atomic directory installs.
 * @path docker/patches/common/20-install-components.mjs
 */
import process from "process";
import { ComponentInstaller } from "./helpers/componentInstaller.mjs";

console.log("[patch] JS patch running; FOUNDRY_DATA_DIR=", process.env.FOUNDRY_DATA_DIR || "(unset)");

// Get the environment
const ENV = process.env;

/**
 * Fallbacks for missing environment variables.
 * @type {Record<string, string>}
 */
const FALLBACKS = {
  VERSION: "13",
  DATA_DIR: "/data/Data",
  CONTAINER_CONFIG_PATH: "/config/container-config.json"
};

/**
 * Directory names within Foundry data dir
 * @type {Record<string, string>}
 */
const DIRS = {
  SYSTEMS: "systems",
  MODULES: "modules",
  WORLDS: "worlds"
};

// The implementation of ComponentInstaller has been moved to helpers/componentInstaller.mjs
// to allow reuse and keep this top-level patch small. Import the class and use it below.

// Instantiate and run the installer
const installer = new ComponentInstaller(
  ENV,
  FALLBACKS,
  DIRS
);

/**
 * Install components as per configuration.
 */
await installer.install();