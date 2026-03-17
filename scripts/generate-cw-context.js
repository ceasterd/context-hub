#!/usr/bin/env node
/**
 * generate-cw-context.js
 *
 * Generates a ConnectWise Manage API reference library for chub (context-hub)
 * from the ConnectWise swagger.json zip file.
 *
 * Usage (run from repo root in PowerShell or CMD):
 *   node scripts/generate-cw-context.js
 *
 * Output:
 *   quotametics-context/content/   ← source content
 *   quotametics-context/dist/      ← built registry (pointed to by chub config)
 *
 * After running, use:
 *   chub search connectwise
 *   chub get quotametics/connectwise-service
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// ─── Config ──────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const ZIP_PATH = path.join(REPO_ROOT, 'swagger25.0.5.zip');
const EXTRACT_DIR = path.join(REPO_ROOT, 'swagger-extract');
const OUTPUT_DIR = path.join(REPO_ROOT, 'quotametics-context');
const CONTENT_DIR = path.join(OUTPUT_DIR, 'content');
const DIST_DIR = path.join(OUTPUT_DIR, 'dist');
const CHUB_CONFIG_DIR = path.join(os.homedir(), '.chub');
const CHUB_CONFIG_PATH = path.join(CHUB_CONFIG_DIR, 'config.yaml');
const TODAY = new Date().toISOString().slice(0, 10);

// Modules to generate (first path segment → display name / metadata)
const MODULE_META = {
  company: {
    displayName: 'Company',
    description: 'ConnectWise Manage Company module — companies, contacts, configurations, sites, and communication methods',
    tags: 'connectwise,company,contacts,configurations,crm,psa',
    keyResources: ['Companies', 'Contacts', 'Configurations', 'Sites', 'CommunicationTypes', 'GroupCompanies'],
    summary: 'Manages CRM data: client companies, contacts, communication methods, and equipment configurations.',
  },
  service: {
    displayName: 'Service',
    description: 'ConnectWise Manage Service module — tickets, boards, priorities, statuses, SLAs, teams, and notes',
    tags: 'connectwise,service,tickets,helpdesk,boards,sla,psa',
    keyResources: ['Tickets', 'Boards', 'Priorities', 'Statuses', 'Teams', 'SLAs', 'Notes', 'TicketTasks'],
    summary: 'Core help-desk / service-desk module. Tickets are the primary work item; boards organise queues.',
  },
  finance: {
    displayName: 'Finance',
    description: 'ConnectWise Manage Finance module — invoices, agreements, payments, tax codes, and billing',
    tags: 'connectwise,finance,invoices,agreements,billing,payments,psa',
    keyResources: ['Invoices', 'Agreements', 'AgreementAdditions', 'Payments', 'TaxCodes', 'BatchSetups'],
    summary: 'Handles recurring agreements, one-time invoices, tax codes, and payment records.',
  },
  project: {
    displayName: 'Project',
    description: 'ConnectWise Manage Project module — projects, phases, project tickets, billing rates, and team members',
    tags: 'connectwise,project,phases,billing,psa',
    keyResources: ['Projects', 'Phases', 'ProjectTickets', 'ProjectNotes', 'TeamMembers', 'BillingRates'],
    summary: 'Tracks project work broken into phases and tickets, with per-project team and billing configuration.',
  },
  sales: {
    displayName: 'Sales',
    description: 'ConnectWise Manage Sales module — opportunities, orders, activities, quotes, and sales forecasts',
    tags: 'connectwise,sales,opportunities,quotes,orders,crm,psa',
    keyResources: ['Opportunities', 'Orders', 'Activities', 'SalesProbabilities', 'Forecasts', 'Stages'],
    summary: 'CRM pipeline management: opportunities move through stages toward orders/quotes.',
  },
  time: {
    displayName: 'Time',
    description: 'ConnectWise Manage Time module — time entries, accruals, work types, and work roles',
    tags: 'connectwise,time,entries,accruals,worktypes,psa',
    keyResources: ['TimeEntries', 'Accruals', 'WorkTypes', 'WorkRoles', 'TimePeriods'],
    summary: 'Time tracking against tickets, projects, or agreements. Drives billing and payroll.',
  },
  procurement: {
    displayName: 'Procurement',
    description: 'ConnectWise Manage Procurement module — products, catalog, purchase orders, and inventory',
    tags: 'connectwise,procurement,products,inventory,catalog,purchasing,psa',
    keyResources: ['Products', 'CatalogItems', 'PurchaseOrders', 'Vendors', 'Inventory', 'Subcategories'],
    summary: 'Product catalog and purchasing: manage items, vendors, and inventory across warehouses.',
  },
  schedule: {
    displayName: 'Schedule',
    description: 'ConnectWise Manage Schedule module — calendar entries, types, and statuses',
    tags: 'connectwise,schedule,calendar,dispatch,psa',
    keyResources: ['ScheduleEntries', 'ScheduleTypes', 'ScheduleStatuses', 'ScheduleColors'],
    summary: 'Dispatch board and calendar management. Links members to tickets/activities at specific times.',
  },
  system: {
    displayName: 'System',
    description: 'ConnectWise Manage System module — members, security roles, custom fields, reports, and system config',
    tags: 'connectwise,system,members,security,customfields,reports,psa',
    keyResources: ['Members', 'SecurityRoles', 'CustomFields', 'Reports', 'UserDefinedFields', 'MemberTypes'],
    summary: 'Administration module: user/member management, permissions, custom field definitions, and reporting.',
  },
  expense: {
    displayName: 'Expense',
    description: 'ConnectWise Manage Expense module — expense entries, expense reports, and expense types',
    tags: 'connectwise,expense,reports,reimbursement,psa',
    keyResources: ['ExpenseEntries', 'ExpenseReports', 'ExpenseTypes', 'Classifications'],
    summary: 'Tracks staff expense claims against tickets or projects, with approval workflow.',
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  wrote: ${path.relative(REPO_ROOT, filePath)}`);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function httpMethodOrder(method) {
  return { GET: 0, POST: 1, PUT: 2, PATCH: 3, DELETE: 4 }[method] ?? 5;
}

// ─── Step 1: Extract zip ──────────────────────────────────────────────────────

function extractZip() {
  if (!fs.existsSync(ZIP_PATH)) {
    console.error(`\n❌  Zip not found: ${ZIP_PATH}`);
    console.error('    Place swagger25.0.5.zip in the repo root and re-run.\n');
    process.exit(1);
  }

  if (fs.existsSync(EXTRACT_DIR)) {
    console.log('📦  swagger-extract/ already exists, skipping extraction.');
    return;
  }

  console.log('📦  Extracting swagger zip via PowerShell…');
  try {
    execSync(
      `powershell -NoProfile -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${EXTRACT_DIR}' -Force"`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error('❌  PowerShell extraction failed:', err.message);
    console.error('    Please manually extract swagger25.0.5.zip to swagger-extract/ and re-run.\n');
    process.exit(1);
  }
}

// ─── Step 2: Find swagger JSON ─────────────────────────────────────────────────

function findSwaggerJson(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Prefer files explicitly named swagger.json
  for (const e of entries) {
    if (!e.isDirectory() && e.name.toLowerCase() === 'swagger.json') {
      return path.join(dir, e.name);
    }
  }
  // Any .json file
  for (const e of entries) {
    if (!e.isDirectory() && e.name.endsWith('.json')) {
      return path.join(dir, e.name);
    }
  }
  // Recurse
  for (const e of entries) {
    if (e.isDirectory()) {
      const found = findSwaggerJson(path.join(dir, e.name));
      if (found) return found;
    }
  }
  return null;
}

// ─── Step 3: Group paths by module ───────────────────────────────────────────

function groupByModule(swagger) {
  const modules = {};

  for (const [routePath, pathItem] of Object.entries(swagger.paths || {})) {
    // First non-empty segment: /service/tickets/{id} → "service"
    const segment = routePath.replace(/^\//, '').split('/')[0].toLowerCase();

    if (!modules[segment]) {
      modules[segment] = { operations: [] };
    }

    for (const [method, op] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;

      modules[segment].operations.push({
        method: method.toUpperCase(),
        path: routePath,
        summary: (op.summary || '').trim(),
        description: (op.description || '').trim(),
        tags: op.tags || [],
        parameters: op.parameters || [],
        responses: op.responses || {},
        operationId: op.operationId || '',
      });
    }
  }

  // Sort each module's operations: by path then by HTTP method order
  for (const mod of Object.values(modules)) {
    mod.operations.sort((a, b) => {
      const pathCmp = a.path.localeCompare(b.path);
      return pathCmp !== 0 ? pathCmp : httpMethodOrder(a.method) - httpMethodOrder(b.method);
    });
  }

  return modules;
}

// ─── Step 4: DOC.md generation ───────────────────────────────────────────────

const AUTH_SECTION = `## Authentication

All ConnectWise Manage API requests require three HTTP headers:

\`\`\`
clientid: {your-connectwise-client-id}
Authorization: Basic {base64(companyId+publicKey+privateKey)}
Content-Type: application/json
\`\`\`

Build the Authorization header value:

\`\`\`python
import base64, requests

company_id  = "YourCompanyId"   # ConnectWise company identifier
public_key  = "yourPublicKey"
private_key = "yourPrivateKey"
client_id   = "yourClientId"    # from developer.connectwise.com

token = base64.b64encode(f"{company_id}+{public_key}+{private_key}".encode()).decode()

headers = {
    "clientid": client_id,
    "Authorization": f"Basic {token}",
    "Content-Type": "application/json",
}
\`\`\`

\`\`\`javascript
const token = Buffer.from(\`\${companyId}+\${publicKey}+\${privateKey}\`).toString('base64');
const headers = {
  clientid: clientId,
  Authorization: \`Basic \${token}\`,
  'Content-Type': 'application/json',
};
\`\`\``;

const PAGINATION_SECTION = `## Pagination, Filtering & Sorting

All list endpoints support standard query parameters:

| Parameter | Example | Description |
|-----------|---------|-------------|
| \`page\` | \`page=2\` | Page number, 1-based |
| \`pageSize\` | \`pageSize=50\` | Records per page (max 1000, default 25) |
| \`conditions\` | \`conditions=status/name="New"\` | SQL-like filter expression |
| \`orderBy\` | \`orderBy=id desc\` | Sort field and direction |
| \`fields\` | \`fields=id,summary,status\` | Comma-separated field projection |
| \`childConditions\` | \`childConditions=types/id=1\` | Filter on child collection members |

\`\`\`python
# Paginated fetch with filtering
def get_all(base_url, endpoint, headers, conditions=None):
    results, page = [], 1
    while True:
        params = {"page": page, "pageSize": 100}
        if conditions:
            params["conditions"] = conditions
        r = requests.get(f"{base_url}{endpoint}", headers=headers, params=params)
        r.raise_for_status()
        batch = r.json()
        if not batch:
            break
        results.extend(batch)
        page += 1
    return results

# Example: all open high-priority tickets
tickets = get_all(base_url, "/service/tickets", headers,
                  conditions='status/name not in ("Closed","Resolved") and priority/name="High"')
\`\`\`

**Conditions syntax:**
- String equality: \`name="Acme Corp"\`
- Contains: \`name contains "Acme"\`
- In list: \`status/id in (1,2,3)\`
- Date range: \`dateEntered > [2024-01-01T00:00:00Z]\`
- Child collection: \`types/id=4\``;

const ERROR_SECTION = `## Error Handling

| Status | Meaning |
|--------|---------|
| 400 | Bad request — validate required fields and \`conditions\` syntax |
| 401 | Unauthorized — check \`clientid\` and \`Authorization\` headers |
| 403 | Forbidden — API key lacks permission for this operation |
| 404 | Not found — record with given ID does not exist |
| 409 | Conflict — duplicate record or constraint violation |
| 422 | Validation error — response body has field-level details |
| 500 | Server error — retry with exponential back-off |

\`\`\`python
import time

def api_request(method, url, headers, **kwargs):
    for attempt in range(3):
        try:
            r = requests.request(method, url, headers=headers, **kwargs)
            r.raise_for_status()
            return r.json()
        except requests.HTTPError as e:
            status = e.response.status_code
            if status == 401:
                raise RuntimeError("Check clientid and Authorization headers") from e
            if status == 404:
                return None           # caller decides how to handle missing records
            if status == 429 or status >= 500:
                time.sleep(2 ** attempt)
                continue
            raise                     # 400, 403, 409, 422 are caller errors
    raise RuntimeError(f"Request failed after retries: {url}")
\`\`\``;

function pickExampleOps(ops) {
  const listOps   = ops.filter(o => o.method === 'GET' && !o.path.match(/\{[^}]+\}$/)).slice(0, 3);
  const getByIdOps = ops.filter(o => o.method === 'GET' && o.path.match(/\{id\}$/)).slice(0, 2);
  const createOps = ops.filter(o => o.method === 'POST' && !o.path.match(/\{[^}]+\}/)).slice(0, 2);
  const patchOps  = ops.filter(o => o.method === 'PATCH').slice(0, 1);
  const deleteOps = ops.filter(o => o.method === 'DELETE').slice(0, 1);
  return { listOps, getByIdOps, createOps, patchOps, deleteOps };
}

function opsTable(ops) {
  if (ops.length === 0) return '';
  const rows = ops.map(o => `| \`${o.method}\` | \`${o.path}\` | ${o.summary} |`).join('\n');
  return `| Method | Path | Description |\n|--------|------|-------------|\n${rows}`;
}

function generateDocMd(moduleName, moduleData, swaggerVersion) {
  const meta = MODULE_META[moduleName] || {
    displayName: capitalize(moduleName),
    description: `ConnectWise Manage ${capitalize(moduleName)} module`,
    tags: `connectwise,${moduleName},psa`,
    keyResources: [],
    summary: `${capitalize(moduleName)} module REST API.`,
  };

  const ops = moduleData.operations;
  const { listOps, getByIdOps, createOps, patchOps, deleteOps } = pickExampleOps(ops);

  // Build a representative GET example from the first list endpoint
  const firstList = listOps[0];
  const firstCreate = createOps[0];

  const getExample = firstList
    ? `\`\`\`python
base_url = "https://na.myconnectwise.net/v4_6_release/apis/3.0"

r = requests.get(
    f"{base_url}${firstList.path}",
    headers=headers,
    params={"pageSize": 50, "orderBy": "id desc"},
)
r.raise_for_status()
items = r.json()   # list of dicts
\`\`\``
    : '';

  const createExample = firstCreate
    ? `\`\`\`python
payload = {
    # Required fields depend on your board/type configuration — see reference
}
r = requests.post(
    f"{base_url}${firstCreate.path}",
    headers=headers,
    json=payload,
)
r.raise_for_status()
new_record = r.json()
print(new_record["id"])
\`\`\``
    : '';

  return `---
name: connectwise-${moduleName}
description: "${meta.description}"
metadata:
  languages: "python,javascript"
  versions: "${swaggerVersion}"
  revision: 1
  updated-on: "${TODAY}"
  source: maintainer
  tags: "${meta.tags}"
---

# ConnectWise Manage — ${meta.displayName} Module

${meta.summary}

**API version:** ${swaggerVersion} | **Operations in this module:** ${ops.length}

**Key resources:** ${meta.keyResources.join(', ')}

**Base URL:** \`https://{cw-host}/v4_6_release/apis/3.0\`
Common hosts: \`na.myconnectwise.net\`, \`eu.myconnectwise.net\`, \`au.myconnectwise.net\`

---

${AUTH_SECTION}

---

${PAGINATION_SECTION}

---

## Common Operations

${listOps.length > 0 ? `### List / Search\n\n${opsTable(listOps)}\n\n${getExample}` : ''}

${getByIdOps.length > 0 ? `### Get by ID\n\n${opsTable(getByIdOps)}` : ''}

${createOps.length > 0 ? `### Create\n\n${opsTable(createOps)}\n\n${createExample}` : ''}

${patchOps.length > 0 ? `### Update (PATCH)\n\n${opsTable(patchOps)}\n\nUse PATCH to update individual fields without sending the full object:

\`\`\`python
r = requests.patch(
    f"{base_url}${patchOps[0]?.path || ''}",
    headers=headers,
    json=[{"op": "replace", "path": "/fieldName", "value": "newValue"}],
)
\`\`\`` : ''}

${deleteOps.length > 0 ? `### Delete\n\n${opsTable(deleteOps)}` : ''}

---

${ERROR_SECTION}

---

## Reference Files

Full endpoint listings are in the reference files (fetch with \`chub get quotametics/connectwise-${moduleName} --full\`):

- \`references/${moduleName}-endpoints.md\` — all ${ops.length} operations with parameters and response types
`;
}

// ─── Step 5: Reference file generation ───────────────────────────────────────

function paramList(params) {
  if (!params || params.length === 0) return '';
  const lines = params.map(p => {
    const req = p.required ? ' **required**' : '';
    const type = p.type || (p.schema && (p.schema.$ref?.split('/').pop() || p.schema.type)) || 'string';
    return `  - \`${p.name}\` (${p.in}, ${type}${req}): ${p.description || ''}`;
  });
  return lines.join('\n');
}

function responseInfo(responses) {
  const successCode = Object.keys(responses || {}).find(c => c.startsWith('2')) || '200';
  const resp = responses?.[successCode];
  if (!resp) return '';
  const schema = resp.schema;
  if (!schema) return `→ ${successCode} (no body)`;
  if (schema.type === 'array') {
    const item = schema.items?.$ref?.split('/').pop() || schema.items?.type || 'object';
    return `→ ${successCode} array of \`${item}\``;
  }
  const ref = schema.$ref?.split('/').pop() || schema.type || 'object';
  return `→ ${successCode} \`${ref}\``;
}

function generateReferenceMd(moduleName, moduleData, swaggerVersion) {
  const ops = moduleData.operations;
  const meta = MODULE_META[moduleName];
  const displayName = meta?.displayName || capitalize(moduleName);

  // Group by second path segment (resource)
  const byResource = new Map();
  for (const op of ops) {
    const parts = op.path.replace(/^\//, '').split('/');
    const resource = parts[1] || parts[0];
    if (!byResource.has(resource)) byResource.set(resource, []);
    byResource.get(resource).push(op);
  }

  let md = `# ConnectWise Manage — ${displayName} Module: All Endpoints\n\n`;
  md += `API version: ${swaggerVersion} | Total operations: ${ops.length}\n\n`;
  md += `---\n\n`;

  for (const [resource, resourceOps] of byResource) {
    md += `## ${resource}\n\n`;

    for (const op of resourceOps) {
      md += `### \`${op.method} ${op.path}\`\n`;
      if (op.summary) md += `${op.summary}\n\n`;

      const pathParams  = op.parameters.filter(p => p.in === 'path');
      const queryParams = op.parameters.filter(p => p.in === 'query');
      const bodyParam   = op.parameters.find(p => p.in === 'body');

      if (pathParams.length > 0) {
        md += `**Path parameters:**\n${paramList(pathParams)}\n\n`;
      }
      if (queryParams.length > 0) {
        md += `**Query parameters:**\n${paramList(queryParams)}\n\n`;
      }
      if (bodyParam) {
        const bodyType = bodyParam.schema?.$ref?.split('/').pop()
          || bodyParam.schema?.type
          || 'object';
        md += `**Request body:** \`${bodyType}\`\n\n`;
      }

      const resp = responseInfo(op.responses);
      if (resp) md += `**Response:** ${resp}\n\n`;

      md += `---\n\n`;
    }
  }

  return md;
}

// ─── Step 6: Update ~/.chub/config.yaml ──────────────────────────────────────

function updateChubConfig(distPath) {
  fs.mkdirSync(CHUB_CONFIG_DIR, { recursive: true });

  // Normalise to forward slashes for cross-platform YAML readability
  const normalised = distPath.replace(/\\/g, '/');

  if (fs.existsSync(CHUB_CONFIG_PATH)) {
    const existing = fs.readFileSync(CHUB_CONFIG_PATH, 'utf8');
    if (existing.includes('quotametics')) {
      console.log('\nℹ️   ~/.chub/config.yaml already contains a quotametics source, skipping update.');
      return;
    }
    // Append to end (simple and safe for any existing format)
    const addition = `  - name: quotametics\n    path: "${normalised}"\n`;
    const updated = existing.trimEnd() + '\n' + addition;
    fs.writeFileSync(CHUB_CONFIG_PATH, updated, 'utf8');
    console.log('\n✅  Updated ~/.chub/config.yaml with quotametics source.');
  } else {
    const config = [
      'sources:',
      '  - name: community',
      '    url: https://cdn.aichub.org/v1',
      `  - name: quotametics`,
      `    path: "${normalised}"`,
      '',
    ].join('\n');
    fs.writeFileSync(CHUB_CONFIG_PATH, config, 'utf8');
    console.log('\n✅  Created ~/.chub/config.yaml with community + quotametics sources.');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  ConnectWise → context-hub generator');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Extract
  extractZip();

  // 2. Find swagger.json
  const swaggerPath = findSwaggerJson(EXTRACT_DIR);
  if (!swaggerPath) {
    console.error('❌  Could not find a .json file inside swagger-extract/');
    console.error('    The zip may not contain a swagger.json — check its contents.\n');
    process.exit(1);
  }
  console.log(`\n📄  Swagger file: ${path.relative(REPO_ROOT, swaggerPath)}`);

  // 3. Parse
  console.log('🔍  Parsing swagger JSON…');
  const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  const swaggerVersion = swagger.info?.version || '25.0.5';
  const pathCount = Object.keys(swagger.paths || {}).length;
  console.log(`    API title:    ${swagger.info?.title || 'ConnectWise Manage'}`);
  console.log(`    API version:  ${swaggerVersion}`);
  console.log(`    Total paths:  ${pathCount}`);

  // 4. Group by module
  const modules = groupByModule(swagger);
  const moduleNames = Object.keys(modules).sort();
  console.log(`    Modules found: ${moduleNames.join(', ')}\n`);

  // 5. Generate content
  console.log('📝  Generating content files…\n');

  let docCount = 0;
  for (const moduleName of moduleNames) {
    const moduleData = modules[moduleName];
    const opCount = moduleData.operations.length;
    if (opCount === 0) continue;

    const entryDir = path.join(CONTENT_DIR, 'quotametics', 'docs', `connectwise-${moduleName}`);
    const refDir   = path.join(entryDir, 'references');

    console.log(`  [${moduleName}] — ${opCount} operations`);

    writeFile(
      path.join(entryDir, 'DOC.md'),
      generateDocMd(moduleName, moduleData, swaggerVersion)
    );
    writeFile(
      path.join(refDir, `${moduleName}-endpoints.md`),
      generateReferenceMd(moduleName, moduleData, swaggerVersion)
    );

    docCount++;
    console.log();
  }

  // 6. Build registry
  console.log('🔨  Building chub registry…');
  const chubBin = process.platform === 'win32' ? 'chub.cmd' : 'chub';
  try {
    execSync(
      `${chubBin} build "${CONTENT_DIR}" -o "${DIST_DIR}"`,
      { stdio: 'inherit', cwd: REPO_ROOT }
    );
    console.log('✅  Registry built successfully.');
  } catch (err) {
    // Fallback: try via npx
    try {
      execSync(
        `npx chub build "${CONTENT_DIR}" -o "${DIST_DIR}"`,
        { stdio: 'inherit', cwd: REPO_ROOT }
      );
      console.log('✅  Registry built (via npx).');
    } catch (err2) {
      console.warn('\n⚠️   chub build failed. Run manually:');
      console.warn(`    chub build "${CONTENT_DIR}" -o "${DIST_DIR}"\n`);
    }
  }

  // 7. Update config
  updateChubConfig(DIST_DIR);

  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Done! Generated ${docCount} ConnectWise module docs.`);
  console.log('═══════════════════════════════════════════════\n');
  console.log('Try:');
  console.log('  chub search connectwise');
  console.log('  chub get quotametics/connectwise-service');
  console.log('  chub get quotametics/connectwise-company');
  console.log('  chub get quotametics/connectwise-service --full');
  console.log('');
}

main().catch(err => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});
