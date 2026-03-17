#!/usr/bin/env node
/**
 * generate-cw-context.js
 *
 * Generates a ConnectWise Automate API reference library for chub (context-hub).
 * Source: ReDoc-generated HTML files inside swagger25.0.5.zip
 * Each HTML file (Tickets.html, Company.html, etc.) contains an embedded
 * __redoc_state object with the full OpenAPI spec for that module.
 *
 * Usage (run from repo root in PowerShell):
 *   node scripts/generate-cw-context.js
 *
 * Output:
 *   quotametics-context/content/   ← source content
 *   quotametics-context/dist/      ← built registry (pointed to by chub config)
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ──────────────────────────────────────────────────────────────────

const REPO_ROOT    = path.resolve(__dirname, '..');
const ZIP_PATH     = path.join(REPO_ROOT, 'swagger25.0.5.zip');
const EXTRACT_DIR  = path.join(REPO_ROOT, 'swagger-extract');
const OUTPUT_DIR   = path.join(REPO_ROOT, 'quotametics-context');
const CONTENT_DIR  = path.join(OUTPUT_DIR, 'content');
const DIST_DIR     = path.join(OUTPUT_DIR, 'dist');
const CHUB_CONFIG_DIR  = path.join(os.homedir(), '.chub');
const CHUB_CONFIG_PATH = path.join(CHUB_CONFIG_DIR, 'config.yaml');
const TODAY = new Date().toISOString().slice(0, 10);

// ─── Utilities ────────────────────────────────────────────────────────────────

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function httpMethodOrder(m) {
  return { GET: 0, POST: 1, PUT: 2, PATCH: 3, DELETE: 4 }[m] ?? 5;
}

// ─── Step 1: Extract zip ──────────────────────────────────────────────────────

function extractZip() {
  if (!fs.existsSync(ZIP_PATH)) {
    console.error(`\n❌  Zip not found: ${ZIP_PATH}\n`);
    process.exit(1);
  }
  if (fs.existsSync(EXTRACT_DIR)) {
    console.log('📦  swagger-extract/ already exists, skipping extraction.');
    return;
  }
  console.log('📦  Extracting zip via PowerShell…');
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${EXTRACT_DIR}' -Force"`,
    { stdio: 'inherit' }
  );
}

// ─── Step 2: Find HTML files ──────────────────────────────────────────────────

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findHtmlFiles(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

// ─── Step 3: Extract OpenAPI spec from ReDoc HTML ─────────────────────────────
//
// ReDoc bakes the spec into the HTML as:
//   var __redoc_state = { "spec": { "data": { ...openapi... } }, ... };
//   Redoc.hydrate(__redoc_state, container);
//
// We slice the string between those two markers and JSON.parse it.

function extractSpecFromHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');

  const START = '__redoc_state = ';
  const startIdx = html.indexOf(START);
  if (startIdx === -1) return null;

  // Find the matching closing brace by counting brace depth
  let depth = 0;
  let inString = false;
  let escape = false;
  let i = startIdx + START.length;
  const end = html.length;

  for (; i < end; i++) {
    const ch = html[i];
    if (escape)           { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"')       { inString = !inString; continue; }
    if (inString)         continue;
    if (ch === '{')       { depth++; }
    else if (ch === '}')  { depth--; if (depth === 0) { i++; break; } }
  }

  const jsonStr = html.slice(startIdx + START.length, i);
  try {
    const state = JSON.parse(jsonStr);
    // ReDoc stores the spec at state.spec.data (parsed) or state.spec.data
    return state?.spec?.data ?? null;
  } catch (err) {
    console.warn(`  ⚠️  JSON parse failed for ${path.basename(htmlPath)}: ${err.message}`);
    return null;
  }
}

// ─── Step 4: Build operations list from spec ─────────────────────────────────

function extractOperations(spec) {
  const ops = [];
  for (const [routePath, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
      ops.push({
        method: method.toUpperCase(),
        path: routePath,
        summary: (op.summary || '').trim(),
        description: (op.description || '').trim(),
        parameters: op.parameters || [],
        responses: op.responses || {},
        operationId: op.operationId || '',
      });
    }
  }
  ops.sort((a, b) => {
    const p = a.path.localeCompare(b.path);
    return p !== 0 ? p : httpMethodOrder(a.method) - httpMethodOrder(b.method);
  });
  return ops;
}

// ─── Step 5: DOC.md generation ────────────────────────────────────────────────

const AUTH_SECTION = `## Authentication

ConnectWise Automate API uses **API keys** tied to a specific user. Pass credentials via the \`Authorization\` header:

\`\`\`
Authorization: Bearer {your-api-token}
\`\`\`

Obtain a token:
\`\`\`python
import requests

r = requests.post(
    "https://{automate-host}/cwa/api/v1/apitoken",
    json={"UserName": "username", "Password": "password", "TwoFactorPasscode": ""},
)
token = r.json()["AccessToken"]

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
}
\`\`\`

\`\`\`javascript
const r = await fetch('https://{automate-host}/cwa/api/v1/apitoken', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ UserName: 'user', Password: 'pass', TwoFactorPasscode: '' }),
});
const { AccessToken } = await r.json();
const headers = { Authorization: \`Bearer \${AccessToken}\`, 'Content-Type': 'application/json' };
\`\`\``;

const PAGINATION_SECTION = `## Pagination & Filtering

List endpoints support standard query parameters:

| Parameter | Example | Description |
|-----------|---------|-------------|
| \`page\` | \`page=2\` | Page number (1-based) |
| \`pagesize\` | \`pagesize=100\` | Records per page |
| \`condition\` | \`condition=Status='Open'\` | Filter expression |
| \`orderby\` | \`orderby=Id desc\` | Sort field and direction |

\`\`\`python
def get_all(base_url, endpoint, headers, condition=None):
    results, page = [], 1
    while True:
        params = {"page": page, "pagesize": 100}
        if condition:
            params["condition"] = condition
        r = requests.get(f"{base_url}{endpoint}", headers=headers, params=params)
        r.raise_for_status()
        batch = r.json()
        if not batch:
            break
        results.extend(batch)
        page += 1
    return results
\`\`\``;

const ERROR_SECTION = `## Error Handling

| Status | Meaning |
|--------|---------|
| 400 | Bad request — check required fields and filter syntax |
| 401 | Unauthorized — token expired or invalid |
| 403 | Forbidden — user lacks permission |
| 404 | Not found — resource ID does not exist |
| 500 | Server error — retry with back-off |

\`\`\`python
import time

def api_call(method, url, headers, **kwargs):
    for attempt in range(3):
        r = requests.request(method, url, headers=headers, **kwargs)
        if r.status_code == 401:
            raise RuntimeError("Token expired — re-authenticate")
        if r.status_code >= 500:
            time.sleep(2 ** attempt)
            continue
        r.raise_for_status()
        return r.json() if r.content else None
    raise RuntimeError(f"Failed after retries: {url}")
\`\`\``;

function opsTable(ops) {
  if (!ops.length) return '';
  const rows = ops.map(o => `| \`${o.method}\` | \`${o.path}\` | ${o.summary} |`).join('\n');
  return `| Method | Path | Description |\n|--------|------|-------------|\n${rows}`;
}

function generateDocMd(moduleName, ops, spec) {
  const title = spec.info?.title || `ConnectWise Automate — ${moduleName}`;
  const apiVersion = spec.info?.version || '25.0.5';
  const baseUrl = spec.basePath
    ? `https://{automate-host}${spec.basePath}`
    : 'https://{automate-host}/cwa/api/v1';

  const listOps    = ops.filter(o => o.method === 'GET' && !o.path.match(/\{[^}]+\}$/)).slice(0, 3);
  const getByIdOps = ops.filter(o => o.method === 'GET' && o.path.match(/\{[^}]+\}$/)).slice(0, 2);
  const createOps  = ops.filter(o => o.method === 'POST').slice(0, 2);
  const patchOps   = ops.filter(o => o.method === 'PATCH').slice(0, 1);
  const deleteOps  = ops.filter(o => o.method === 'DELETE').slice(0, 1);

  const firstList = listOps[0];
  const getExample = firstList ? `\`\`\`python
base_url = "${baseUrl}"

r = requests.get(
    f"{base_url}${firstList.path}",
    headers=headers,
    params={"pagesize": 100},
)
r.raise_for_status()
items = r.json()
\`\`\`` : '';

  const firstCreate = createOps[0];
  const createExample = firstCreate ? `\`\`\`python
payload = {}  # see reference file for required fields
r = requests.post(f"{base_url}${firstCreate.path}", headers=headers, json=payload)
r.raise_for_status()
new_record = r.json()
\`\`\`` : '';

  return `---
name: connectwise-automate-${moduleName.toLowerCase()}
description: "ConnectWise Automate ${moduleName} API — ${ops.length} operations for managing ${moduleName.toLowerCase()} via the Automate RMM platform"
metadata:
  languages: "python,javascript"
  versions: "${apiVersion}"
  revision: 1
  updated-on: "${TODAY}"
  source: maintainer
  tags: "connectwise,automate,rmm,${moduleName.toLowerCase()},psa"
---

# ConnectWise Automate — ${moduleName}

${spec.info?.description ? spec.info.description.split('\n')[0] : `REST API for the ConnectWise Automate ${moduleName} module.`}

**API version:** ${apiVersion} | **Operations:** ${ops.length}

**Base URL:** \`${baseUrl}\`

---

${AUTH_SECTION}

---

${PAGINATION_SECTION}

---

## Common Operations

${listOps.length    ? `### List / Search\n\n${opsTable(listOps)}\n\n${getExample}\n` : ''}
${getByIdOps.length ? `### Get by ID\n\n${opsTable(getByIdOps)}\n` : ''}
${createOps.length  ? `### Create\n\n${opsTable(createOps)}\n\n${createExample}\n` : ''}
${patchOps.length   ? `### Update (PATCH)\n\n${opsTable(patchOps)}\n` : ''}
${deleteOps.length  ? `### Delete\n\n${opsTable(deleteOps)}\n` : ''}

---

${ERROR_SECTION}

---

## Reference

Full endpoint listing with all parameters:
\`references/${moduleName.toLowerCase()}-endpoints.md\` (fetch with \`chub get quotametics/connectwise-automate-${moduleName.toLowerCase()} --full\`)
`;
}

// ─── Step 6: Reference file ───────────────────────────────────────────────────

function paramList(params) {
  return params.map(p => {
    const type = p.schema?.type || p.type || 'string';
    const req  = p.required ? ' **required**' : '';
    return `  - \`${p.name}\` (${p.in}, ${type}${req}): ${p.description || ''}`;
  }).join('\n');
}

function responseInfo(responses) {
  const code = Object.keys(responses || {}).find(c => c.startsWith('2')) || '200';
  const resp = responses?.[code];
  if (!resp) return '';
  const schema = resp.schema || resp.content?.['application/json']?.schema;
  if (!schema) return `${code} (no body)`;
  if (schema.type === 'array') {
    const item = schema.items?.$ref?.split('/').pop() || schema.items?.type || 'object';
    return `${code} array of \`${item}\``;
  }
  return `${code} \`${schema.$ref?.split('/').pop() || schema.type || 'object'}\``;
}

function generateReferenceMd(moduleName, ops, spec) {
  const apiVersion = spec.info?.version || '25.0.5';
  let md = `# ConnectWise Automate — ${moduleName}: All Endpoints\n\n`;
  md += `API version: ${apiVersion} | Total operations: ${ops.length}\n\n---\n\n`;

  // Group by top-level resource path
  const byResource = new Map();
  for (const op of ops) {
    const parts = op.path.replace(/^\//, '').split('/');
    const resource = parts[0] || 'root';
    if (!byResource.has(resource)) byResource.set(resource, []);
    byResource.get(resource).push(op);
  }

  for (const [resource, resourceOps] of byResource) {
    md += `## ${resource}\n\n`;
    for (const op of resourceOps) {
      md += `### \`${op.method} ${op.path}\`\n`;
      if (op.summary) md += `${op.summary}\n\n`;

      const pathParams  = op.parameters.filter(p => p.in === 'path');
      const queryParams = op.parameters.filter(p => p.in === 'query');
      const bodyParam   = op.parameters.find(p  => p.in === 'body');

      if (pathParams.length)  md += `**Path parameters:**\n${paramList(pathParams)}\n\n`;
      if (queryParams.length) md += `**Query parameters:**\n${paramList(queryParams)}\n\n`;
      if (bodyParam) {
        const bt = bodyParam.schema?.$ref?.split('/').pop() || bodyParam.schema?.type || 'object';
        md += `**Request body:** \`${bt}\`\n\n`;
      }
      const resp = responseInfo(op.responses);
      if (resp) md += `**Response:** ${resp}\n\n`;
      md += `---\n\n`;
    }
  }
  return md;
}

// ─── Step 7: Update ~/.chub/config.yaml ──────────────────────────────────────

function updateChubConfig() {
  fs.mkdirSync(CHUB_CONFIG_DIR, { recursive: true });
  const distNorm = DIST_DIR.replace(/\\/g, '/');

  if (fs.existsSync(CHUB_CONFIG_PATH)) {
    const existing = fs.readFileSync(CHUB_CONFIG_PATH, 'utf8');
    if (existing.includes('quotametics')) {
      console.log('ℹ️   ~/.chub/config.yaml already has quotametics source.');
      return;
    }
    fs.writeFileSync(CHUB_CONFIG_PATH,
      existing.trimEnd() + `\n  - name: quotametics\n    path: "${distNorm}"\n`);
  } else {
    fs.writeFileSync(CHUB_CONFIG_PATH, [
      'sources:',
      '  - name: community',
      '    url: https://cdn.aichub.org/v1',
      `  - name: quotametics`,
      `    path: "${distNorm}"`,
      '',
    ].join('\n'));
  }
  console.log('✅  Updated ~/.chub/config.yaml');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  ConnectWise Automate → context-hub generator');
  console.log('═══════════════════════════════════════════════\n');

  extractZip();

  const htmlFiles = findHtmlFiles(EXTRACT_DIR);
  if (!htmlFiles.length) {
    console.error('❌  No HTML files found in swagger-extract/');
    process.exit(1);
  }
  console.log(`\n📄  Found ${htmlFiles.length} HTML module files\n`);
  console.log('📝  Extracting specs and generating docs…\n');

  let docCount = 0;

  for (const htmlFile of htmlFiles) {
    const moduleName = path.basename(htmlFile, '.html');
    process.stdout.write(`  [${moduleName}] extracting spec… `);

    const spec = extractSpecFromHtml(htmlFile);
    if (!spec) {
      console.log('⚠️  skipped (could not extract spec)');
      continue;
    }

    const ops = extractOperations(spec);
    if (!ops.length) {
      console.log('⚠️  skipped (no operations)');
      continue;
    }
    console.log(`${ops.length} operations`);

    const entryDir = path.join(CONTENT_DIR, 'quotametics', 'docs', `connectwise-automate-${moduleName.toLowerCase()}`);
    const refDir   = path.join(entryDir, 'references');

    writeFile(path.join(entryDir, 'DOC.md'),
      generateDocMd(moduleName, ops, spec));
    writeFile(path.join(refDir, `${moduleName.toLowerCase()}-endpoints.md`),
      generateReferenceMd(moduleName, ops, spec));

    docCount++;
  }

  console.log(`\n✅  Generated ${docCount} module docs\n`);

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
    } catch (err2) {
      console.warn(`⚠️  chub build failed — run manually:\n    chub build "${CONTENT_DIR}" -o "${DIST_DIR}"\n`);
    }
  }

  updateChubConfig();

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Done! ${docCount} ConnectWise Automate module docs`);
  console.log('═══════════════════════════════════════════════\n');
  console.log('Try:');
  console.log('  chub search connectwise');
  console.log('  chub get quotametics/connectwise-automate-tickets');
  console.log('  chub get quotametics/connectwise-automate-computers');
  console.log('  chub get quotametics/connectwise-automate-tickets --full\n');
}

main().catch(err => {
  console.error('\n❌  Fatal:', err.message);
  process.exit(1);
});
