#!/usr/bin/env node
/**
 * build-quotametics-registry.js
 *
 * Builds the quotametics chub registry from pre-written content and
 * wires up ~/.chub/config.yaml.
 *
 * Usage (run from repo root in PowerShell):
 *   node scripts/build-quotametics-registry.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const REPO_ROOT   = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'quotametics-context', 'content');
const DIST_DIR    = path.join(REPO_ROOT, 'quotametics-context', 'dist');
const CHUB_DIR    = path.join(os.homedir(), '.chub');
const CHUB_CONFIG = path.join(CHUB_DIR, 'config.yaml');

// Build registry
console.log('🔨  Building chub registry…');
const chubBin = process.platform === 'win32' ? 'chub.cmd' : 'chub';
try {
  execSync(`${chubBin} build "${CONTENT_DIR}" -o "${DIST_DIR}"`,
    { stdio: 'inherit', cwd: REPO_ROOT });
} catch {
  try {
    execSync(`npx chub build "${CONTENT_DIR}" -o "${DIST_DIR}"`,
      { stdio: 'inherit', cwd: REPO_ROOT });
  } catch (err) {
    console.error(`❌  chub build failed:\n    ${err.message}`);
    console.error(`    Run manually: chub build "${CONTENT_DIR}" -o "${DIST_DIR}"`);
    process.exit(1);
  }
}

// Update ~/.chub/config.yaml
fs.mkdirSync(CHUB_DIR, { recursive: true });
const distNorm = DIST_DIR.replace(/\\/g, '/');

if (fs.existsSync(CHUB_CONFIG)) {
  const existing = fs.readFileSync(CHUB_CONFIG, 'utf8');
  if (existing.includes('quotametics')) {
    console.log('ℹ️   ~/.chub/config.yaml already has quotametics source.');
  } else {
    fs.writeFileSync(CHUB_CONFIG,
      existing.trimEnd() + `\n  - name: quotametics\n    path: "${distNorm}"\n`);
    console.log('✅  Updated ~/.chub/config.yaml');
  }
} else {
  fs.writeFileSync(CHUB_CONFIG,
    `sources:\n  - name: community\n    url: https://cdn.aichub.org/v1\n  - name: quotametics\n    path: "${distNorm}"\n`);
  console.log('✅  Created ~/.chub/config.yaml');
}

console.log('\nDone. Try:');
console.log('  chub search connectwise');
console.log('  chub get quotametics/connectwise-manage');
console.log('  chub get quotametics/connectwise-manage --full\n');
