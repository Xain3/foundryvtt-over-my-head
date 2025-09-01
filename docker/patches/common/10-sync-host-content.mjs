#!/usr/bin/env node
/**
 * @file 10-sync-host-content.mjs
 * @description Mirrors host build output into the container and bidirectionally syncs a development world using rsync (preferred) or cp fallback with safe pruning.
 * @path docker/patches/common/10-sync-host-content.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import * as f from "./helpers/common.mjs";

// 10-sync-host-content.mjs
// - Mirrors module build (host -> container) with delete policy
// - Syncs world bidirectionally (host <-> container)
// - Prefers rsync with safe flags; falls back to cp when needed

const ENV = process.env;

const MODULE_SRC = ENV.MODULE_SRC || "/host/dist";
const MODULE_DST = ENV.MODULE_DST || "/data/Data/modules/foundryvtt-over-my-head";
const WORLD_SRC  = ENV.WORLD_SRC  || "/host/shared/worlds/test-world";
const WORLD_DST  = ENV.WORLD_DST  || "/data/Data/worlds/test-world";

let SYNC_INTERVAL = Number(ENV.SYNC_INTERVAL || 1);
if (!Number.isFinite(SYNC_INTERVAL) || SYNC_INTERVAL < 1) SYNC_INTERVAL = 1;

const RSYNC_COMMON = ENV.RSYNC_COMMON || "-a --delay-updates --partial-dir=.rsync-partial";
const HOST_UID = ENV.HOST_UID;
const HOST_GID = ENV.HOST_GID;
const PATCH_DRY_RUN = f.parseBoolEnv(ENV.PATCH_DRY_RUN, false);
const PATCH_DEBUG = f.parseBoolEnv(ENV.PATCH_DEBUG, false);
const WORLD_SYNC_ENABLED = f.parseBoolEnv(ENV.WORLD_SYNC_ENABLED, true);
const WORLD_INITIAL_SYNC = f.parseBoolEnv(ENV.WORLD_INITIAL_SYNC, true);

function log(...args) { console.log("[patch] 10-sync-host-content:", ...args); }
function dlog(...args) { if (PATCH_DEBUG) console.log("[patch][debug] 10-sync-host-content:", ...args); }

/**
 * Remove a legacy symlink if present so Foundry can write to real directories.
 * @param {string} p
 */
function removeLegacySymlink(p) {
  try {
    const st = fs.lstatSync(p);
    if (st.isSymbolicLink()) {
      log(`Removing legacy symlink at ${p}${PATCH_DRY_RUN ? " (dry-run)" : ""}`);
      if (!PATCH_DRY_RUN) { try { fs.unlinkSync(p); } catch {} }
    }
  } catch {}
}

/**
 * Ensure destination directory exists.
 * @param {string} p
 */
function ensureDir(p) {
  if (PATCH_DRY_RUN) { dlog(`Would ensure directory: ${p}`); return; }
  try { fs.mkdirSync(p, { recursive: true }); } catch {}
}

/**
 * Run a command synchronously with inherited stdio.
 * Honors PATCH_DRY_RUN and PATCH_DEBUG for no-op and logging.
 * @param {string} cmd
 * @param {string[]} args
 * @param {object} [opts]
 * @returns {{status:number}}
 */
function run(cmd, args, opts = {}) {
  dlog(`run: ${cmd} ${args.join(" ")}`);
  if (PATCH_DRY_RUN) return { status: 0 };
  return spawnSync(cmd, args, { stdio: "inherit", ...opts });
}

function rsyncAvailable() {
  return !!f.which("rsync");
}

function cpAvailable() {
  return !!f.which("cp");
}

/**
 * Perform a sync using rsync (preferred) or cp fallback.
 * @param {string} src
 * @param {string} dst
 * @param {"delete"|"keep"} deletePolicy
 * @returns {boolean}
 */
function rsyncWithPolicy(src, dst, deletePolicy) {
  if (rsyncAvailable()) {
    const args = RSYNC_COMMON.split(/\s+/).filter(Boolean);
    if (deletePolicy === "delete") args.push("--delete");
    args.push(`${src}/`, `${dst}/`);
    const r = run("rsync", args);
    if (r.status !== 0) return false;
    return true;
  }
  // Fallback: cp -a then optionally prune (for delete policy only)
  if (cpAvailable()) {
    const r = run("cp", ["-a", `${src}/.`, `${dst}/`]);
    if (r.status !== 0) return false;
    if (deletePolicy === "delete") {
      // prune files not present in src
      if (!PATCH_DRY_RUN) {
        try {
          const walk = (dir) => {
            for (const entry of fs.readdirSync(dir)) {
              const p = path.join(dir, entry);
              const rel = path.relative(dst, p);
              const srcPath = path.join(src, rel);
              try {
                const st = fs.lstatSync(p);
                if (st.isDirectory()) {
                  walk(p);
                  try { if (fs.readdirSync(p).length === 0) fs.rmdirSync(p); } catch {}
                } else if (st.isFile()) {
                  if (!fs.existsSync(srcPath)) {
                    try { fs.unlinkSync(p); } catch {}
                  }
                }
              } catch {}
            }
          };
          walk(dst);
        } catch {}
      } else {
        dlog(`Would prune files not present in ${src} from ${dst}`);
      }
    }
    return true;
  }
  return false;
}

/**
 * Execute one sync cycle: module mirror and world bidirectional sync.
 */
function syncOnce(opts = {}) {
  const initial = !!opts.initial;
  // Module: host -> container (mirror)
  if (fs.existsSync(MODULE_SRC) && fs.statSync(MODULE_SRC).isDirectory()) {
    if (MODULE_DST === "/" || MODULE_SRC === "/") {
      console.error("[patch][error] Aborting module mirror: src or dst is root (/).");
    } else {
      rsyncWithPolicy(MODULE_SRC, MODULE_DST, "delete");
    }
  }

  // World: host -> container
  if (WORLD_SYNC_ENABLED) {
    if (!(initial && !WORLD_INITIAL_SYNC)) {
      if (fs.existsSync(WORLD_SRC) && fs.statSync(WORLD_SRC).isDirectory()) {
        rsyncWithPolicy(WORLD_SRC, WORLD_DST, "keep");

        // Container -> host with optional chown
        if (rsyncAvailable() && HOST_UID && HOST_GID) {
          const args = RSYNC_COMMON.split(/\s+/).filter(Boolean);
          args.push("--no-owner", "--no-group", `--chown=${HOST_UID}:${HOST_GID}`);
          args.push(`${WORLD_DST}/`, `${WORLD_SRC}/`);
          run("rsync", args);
        } else {
          rsyncWithPolicy(WORLD_DST, WORLD_SRC, "keep");
          if (HOST_UID && HOST_GID) {
            try { run("chown", ["-R", `${HOST_UID}:${HOST_GID}`, WORLD_SRC]); } catch {}
          }
        }
      }
    } else {
      dlog("Skipping initial world sync due to WORLD_INITIAL_SYNC=0");
    }
  }
}

/**
 * Entrypoint. Logs config, ensures dirs, runs initial sync, then enters
 * a jittered loop to keep content in sync during development.
 * @returns {Promise<void>}
 */
async function main() {
  log(`MODULE_SRC=${MODULE_SRC} -> MODULE_DST=${MODULE_DST}`);
  if (WORLD_SYNC_ENABLED) {
    log(`WORLD_SRC=${WORLD_SRC} <-> WORLD_DST=${WORLD_DST} (bidirectional)`);
  } else {
    log("World sync disabled (WORLD_SYNC_ENABLED=0)");
  }

  // Cleanup: remove legacy symlinks
  removeLegacySymlink(MODULE_DST);
  if (WORLD_SYNC_ENABLED) removeLegacySymlink(WORLD_DST);

  // Ensure destination directories exist
  ensureDir(MODULE_DST);
  if (WORLD_SYNC_ENABLED) ensureDir(WORLD_DST);

  log(`Initial sync${PATCH_DRY_RUN ? " (dry-run)" : ""}`);
  syncOnce({ initial: true });

  log(`Starting background sync loop (interval=${SYNC_INTERVAL}s)`);
  while (true) {
    await f.sleep(SYNC_INTERVAL * 1000);
    const jitter = Math.random() * 0.5; // up to 500ms
    await f.sleep(jitter * 1000);
    try { syncOnce(); } catch {}
  }
}

main().catch((e) => {
  console.error(`[patch][error] 10-sync-host-content: ${e?.message || e}`);
  process.exit(1);
});
