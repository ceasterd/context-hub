---
name: connectwise-manage
description: "ConnectWise PSA (Manage) REST API — authentication, pagination, filtering, PATCH syntax, callbacks, and key modules: service tickets, companies, finance, projects, sales, time"
metadata:
  languages: "python"
  versions: "2024.1"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "connectwise,manage,psa,tickets,crm,helpdesk,rest"
---

# ConnectWise PSA (Manage) REST API

ConnectWise Manage is a PSA (Professional Services Automation) platform used by MSPs. The REST API covers service tickets, companies, contacts, agreements, invoices, projects, opportunities, time entries, and more.

**Base URLs:**
```
https://api-na.myconnectwise.net/v4_6_release/apis/3.0/   ← cloud (NA)
https://na.myconnectwise.net/v4_6_release/apis/3.0/        ← alternate cloud
https://{your-server}/v4_6_release/apis/3.0/               ← on-premise
```

> **404 on cloud?** If you get a 404 or "no response", you likely have incorrect auth rather than a missing resource. Try replacing `v4_6_release` with your version (e.g. `2024_1`).

---

## Authentication

All requests require **three headers**:

```
clientid: {your-client-id}
Authorization: Basic {base64(companyId+publicKey:privateKey)}
Content-Type: application/json
```

Note the format: `companyId+publicKey:privateKey` — **plus** between company and public key, **colon** between public and private key.

```python
import base64, requests

company_id  = "YourCompanyId"    # CW Manage company identifier
public_key  = "yourPublicKey"    # from System → Members → API Keys
private_key = "yourPrivateKey"
client_id   = "your-client-uuid" # from developer.connectwise.com/ClientId

token = base64.b64encode(
    f"{company_id}+{public_key}:{private_key}".encode()
).decode()

BASE_URL = "https://api-na.myconnectwise.net/v4_6_release/apis/3.0"

headers = {
    "clientid": client_id,
    "Authorization": f"Basic {token}",
    "Content-Type": "application/json",
}
```

```javascript
const token = Buffer.from(`${companyId}+${publicKey}:${privateKey}`).toString('base64');
const headers = {
  clientid: clientId,
  Authorization: `Basic ${token}`,
  'Content-Type': 'application/json',
};
const BASE_URL = 'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
```

**Getting API keys:** System → Members → [member] → API Keys tab → New Key.
**Getting client ID:** Register at `developer.connectwise.com/ClientId` (free).

**Authentication types supported:**
- **API Member** *(recommended for integrations)* — keys tied to a dedicated API member
- **My Account** — keys for the current user account
- **Member Impersonation** / **Cookie** — internal use only

---

## Pagination

Default page size is **25**; maximum is **1,000**.

```python
# Navigable pagination (default)
def get_all(endpoint, params=None):
    results, page = [], 1
    base_params = {"pageSize": 1000, **(params or {})}
    while True:
        r = requests.get(f"{BASE_URL}{endpoint}", headers=headers,
                         params={**base_params, "page": page})
        r.raise_for_status()
        batch = r.json()
        if not batch:
            break
        results.extend(batch)
        # Check Link header for next page
        if 'next' not in r.headers.get('Link', ''):
            break
        page += 1
    return results
```

**Forward-only pagination** (faster for large datasets, added 2018.5):
```python
# Pass pagination-type header; use pageId instead of page
headers_fo = {**headers, "pagination-type": "forward-only"}
pageId = 0
while True:
    r = requests.get(f"{BASE_URL}/service/tickets", headers=headers_fo,
                     params={"pageSize": 1000, "pageId": pageId})
    r.raise_for_status()
    batch = r.json()
    if not batch:
        break
    results.extend(batch)
    pageId = batch[-1]["id"]   # last id in batch becomes next pageId
```

> Forward-only cannot use `orderBy` — results are always ordered by ID.

---

## Filtering & Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `conditions` | SQL-like filter on GET fields | `conditions=status/name="New"` |
| `childConditions` | Filter on child array fields | `childConditions=types/id=4` |
| `customFieldConditions` | Filter on custom fields | `customFieldConditions=caption="Region" AND value="West"` |
| `orderBy` | Sort field and direction | `orderBy=id desc` |
| `fields` | Comma-separated field projection | `fields=id,summary,status` |
| `page` | Page number (1-based) | `page=2` |
| `pageSize` | Records per page (max 1000) | `pageSize=100` |

**Conditions syntax:**

```
# String equality (quotes required)
summary = "Deploy firewall"
board/name = "Integration"

# Contains / wildcard
summary contains "firewall"
summary like "*firewall*"

# Integers (no quotes)
board/id = 5
priority/id in (1, 2, 3)

# Boolean
closedFlag = False

# Datetime (square brackets required)
lastUpdated > [2024-01-01T00:00:00Z]
dateEntered >= [2024-06-01T00:00:00Z]

# Logic operators
board/name = "Integration" and status/name = "New"
board/name = "Helpdesk" or board/name = "Network"

# Reference fields (use / separator)
company/name contains "Acme"
contact/firstName = "Jane"
```

```python
# Example: open high-priority tickets updated in the last 7 days
import datetime
week_ago = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).strftime('%Y-%m-%dT%H:%M:%SZ')

tickets = get_all("/service/tickets", {
    "conditions": f'closedFlag = False and priority/name = "High" and lastUpdated > [{week_ago}]',
    "orderBy": "id desc",
    "fields": "id,summary,status,company,priority,owner",
})
```

**URL-encode special characters in conditions:**
- `&` → `%26`, `"` → `%22`, `*` → `%2A`, `[` → `%5B` (or use a requests library that handles this automatically)

**POST /search** — use when conditions string exceeds ~2000 chars:
```python
r = requests.post(f"{BASE_URL}/service/tickets/search", headers=headers,
                  json={"conditions": "summary like 'firewall'"})
```

---

## HTTP Methods

| Method | Use | Success |
|--------|-----|---------|
| `GET` | Read one or many records | 200 |
| `POST` | Create a record | 201 (body = created record) |
| `PATCH` | Update specific fields | 200 |
| `PUT` | Replace all fields | 200 |
| `DELETE` | Remove a record | 204 (no body) |

---

## PATCH — Updating Records

PATCH updates individual fields without sending the full object. The body is a **JSON array** (square brackets required):

```python
r = requests.patch(
    f"{BASE_URL}/service/tickets/5000",
    headers=headers,
    json=[
        {"op": "replace", "path": "summary", "value": "New summary"},
        {"op": "replace", "path": "status", "value": {"name": "In Progress"}},
        {"op": "replace", "path": "company", "value": {"identifier": "acmecorp"}},
    ]
)
```

| Field | Values |
|-------|--------|
| `op` | `replace`, `add`, `remove` |
| `path` | Field name — **case sensitive** |
| `value` | New value; objects need full replacement (e.g. `{"identifier": "acme"}`) |

> **Important:** When updating a reference object (e.g. `company`), replace the whole object — do NOT use `"path": "company/identifier"`.

**Custom fields** — must pass the entire `customFields` array:
```python
json=[{
    "op": "replace",
    "path": "customFields",
    "value": [
        {"id": 5, "caption": "Region", "type": "Text",
         "entryMethod": "EntryField", "numberOfDecimals": 0, "value": "West"},
    ]
}]
```

---

## Common Operations by Module

### Service Tickets

```python
# List open tickets on a board
tickets = get_all("/service/tickets", {
    "conditions": 'board/name = "Helpdesk" and closedFlag = False',
    "orderBy": "priority/sortOrder asc, id asc",
    "fields": "id,summary,status,priority,owner,company,dateEntered",
})

# Get one ticket
r = requests.get(f"{BASE_URL}/service/tickets/5000", headers=headers)
ticket = r.json()

# Create a ticket
r = requests.post(f"{BASE_URL}/service/tickets", headers=headers, json={
    "summary": "Cannot connect to VPN",
    "board": {"name": "Helpdesk"},
    "company": {"identifier": "acmecorp"},
    "priority": {"name": "High"},
    "status": {"name": "New"},
})
new_ticket = r.json()

# Add a note
r = requests.post(f"{BASE_URL}/service/tickets/5000/notes", headers=headers, json={
    "text": "Checked firewall rules — no issues found.",
    "detailDescriptionFlag": False,
    "internalAnalysisFlag": True,
    "resolutionFlag": False,
})

# Close a ticket
requests.patch(f"{BASE_URL}/service/tickets/5000", headers=headers, json=[
    {"op": "replace", "path": "status", "value": {"name": "Closed"}},
])
```

Key ticket sub-resources: `/notes`, `/timeEntries`, `/tasks`, `/documents`, `/configurations`

### Companies & Contacts

```python
# Find a company
companies = get_all("/company/companies", {
    "conditions": 'name contains "Acme" and status/name = "Active"',
    "fields": "id,name,identifier,status,phoneNumber,website",
})

# Get contacts for a company
contacts = get_all("/company/contacts", {
    "conditions": f"company/id = {company_id}",
    "fields": "id,firstName,lastName,title,communicationItems",
})

# Create a company
r = requests.post(f"{BASE_URL}/company/companies", headers=headers, json={
    "name": "Acme Corp",
    "identifier": "acmecorp",
    "status": {"name": "Active"},
    "phoneNumber": "555-0100",
})
```

### Finance — Agreements & Invoices

```python
# List active agreements
agreements = get_all("/finance/agreements", {
    "conditions": 'cancelledFlag = False',
    "fields": "id,name,company,agreementType,startDate,endDate,billAmount",
})

# Get agreement additions (line items)
additions = get_all(f"/finance/agreements/{agreement_id}/additions")

# List invoices
invoices = get_all("/finance/invoices", {
    "conditions": 'status/name = "Unpaid"',
    "fields": "id,invoiceNumber,company,billToCompany,dueDate,total,balance",
})
```

### Projects

```python
# List active projects
projects = get_all("/project/projects", {
    "conditions": 'status/name not in ("Closed","Cancelled")',
    "fields": "id,name,company,manager,status,estimatedStart,estimatedEnd",
})

# Get project phases
phases = get_all(f"/project/projects/{project_id}/phases")

# Get project tickets
project_tickets = get_all("/project/tickets", {
    "conditions": f"project/id = {project_id}",
})
```

### Time Entries

```python
# Get time entries for a ticket
entries = get_all("/time/entries", {
    "conditions": f"chargeToType = 'ServiceTicket' and chargeToId = {ticket_id}",
    "fields": "id,member,timeStart,timeEnd,actualHours,notes,billableOption",
})

# Create a time entry
r = requests.post(f"{BASE_URL}/time/entries", headers=headers, json={
    "chargeToId": 5000,
    "chargeToType": "ServiceTicket",
    "member": {"identifier": "jsmith"},
    "timeStart": "2024-06-01T09:00:00Z",
    "timeEnd":   "2024-06-01T10:30:00Z",
    "actualHours": 1.5,
    "billableOption": "Billable",
    "notes": "Investigated VPN issue.",
})
```

### Sales — Opportunities

```python
# List open opportunities
opps = get_all("/sales/opportunities", {
    "conditions": 'status/name not in ("Closed Won","Closed Lost")',
    "fields": "id,name,company,contact,stage,probability,closeDate,forecastAmount",
})
```

### Schedule Entries

```python
# Get schedule entries for a member
entries = get_all("/schedule/entries", {
    "conditions": f'member/identifier = "jsmith" and dateStart >= [2024-06-01T00:00:00Z]',
    "fields": "id,objectId,type,member,dateStart,dateEnd,status",
})
```

---

## Callbacks (Webhooks)

CW Manage can POST a payload to your endpoint when records are saved.

**Supported types:** Activities, Agreements, Companies, Contacts, Configurations, Invoice, Expense, Member, Opportunities, Product Catalog, Projects, Purchase Orders, Schedule Entries, Sites, Tickets, Time Entries

```python
# Register a callback
r = requests.post(f"{BASE_URL}/system/callbacks", headers=headers, json={
    "description": "Ticket updates → my integration",
    "url": "https://my-app.example.com/cw-webhook&recordId=",
    "objectId": 1,          # 1 = Owner level (all records)
    "type": "Ticket",
    "level": "Owner",
    "inactiveFlag": False,
})

# List callbacks
callbacks = get_all("/system/callbacks")
```

**Callback URL tip:** Append `&recordId=` to your URL so CW appends the record ID cleanly:
```
https://my-app.example.com/webhook?source=cw&recordId=
→ https://my-app.example.com/webhook?source=cw&recordId=7601&action=updated
```

**Retry behavior:** CW retries on 404/409/419/429 — twice (2s then 4s delay). After 3 consecutive days of failures the callback is disabled.

**Verify callback signature:**
```python
import hmac, hashlib, base64

def verify_callback(payload_json: str, signature_header: str, signing_key: str) -> bool:
    key_hash = hashlib.sha256(signing_key.encode()).digest()
    computed = base64.b64encode(
        hmac.new(key_hash, payload_json.encode(), hashlib.sha256).digest()
    ).decode()
    return hmac.compare_digest(computed, signature_header)
```

---

## Rate Limiting

- Limit: ~**1,000 requests/minute**
- Exceeded requests return **429** with a `Retry-After` header

```python
import time

def api_request(method, url, **kwargs):
    for attempt in range(5):
        r = requests.request(method, url, headers=headers, **kwargs)
        if r.status_code == 429:
            wait = int(r.headers.get("Retry-After", 30)) * (2 ** attempt)
            print(f"Rate limited — waiting {wait}s")
            time.sleep(wait)
            continue
        if r.status_code >= 500:
            time.sleep(2 ** attempt)
            continue
        r.raise_for_status()
        return r
    raise RuntimeError(f"Request failed after retries: {url}")
```

---

## Error Handling

| Status | Meaning |
|--------|---------|
| 200 | Success (GET, PATCH, PUT) |
| 201 | Created (POST — body is new record) |
| 204 | Deleted (DELETE — no body) |
| 400 | Bad request — malformed syntax or missing required field |
| 401 | Unauthorized — wrong credentials or missing headers |
| 403 | Forbidden — security role lacks permission |
| 404 | Not found — wrong ID, or on cloud may indicate bad auth |
| 405 | Method not allowed — HTTP verb not supported by this URL |
| 409 | Conflict — record in use or duplicate |
| 415 | Unsupported media type — usually missing `Content-Type: application/json` |
| 429 | Rate limited — see `Retry-After` header |
| 500 | Server error — retry with back-off |

> On cloud: a 404 often means **incorrect authentication** rather than a missing record. Verify your headers first.

---

## Partial Responses

Limit returned fields to reduce payload size:

```python
# Fields (most endpoints)
params = {"fields": "id,summary,status/name,company/name,priority/name"}

# Columns (reporting endpoints only)
params = {"columns": "id,summary,company/name"}
```

---

## Custom Fields

Endpoints that support custom fields include `customFields` array in GET responses. To search:

```python
# Find contacts where custom field "Region" = "West"
contacts = get_all("/company/contacts", {
    "customFieldConditions": 'caption = "Region" AND value = "West"'
})
```

To update custom fields via PATCH, pass the **entire array**:
```python
requests.patch(f"{BASE_URL}/company/contacts/123", headers=headers, json=[{
    "op": "replace",
    "path": "customFields",
    "value": [
        {"id": 5, "caption": "Region", "type": "Text",
         "entryMethod": "EntryField", "numberOfDecimals": 0, "value": "West"},
        {"id": 8, "caption": "Tier", "type": "Text",
         "entryMethod": "List", "numberOfDecimals": 0, "value": "Gold"},
    ]
}])
```

---

## Reference Files

Full endpoint listings by module (fetch with `chub get quotametics/connectwise-manage --full`):

- `references/service-module.md` — tickets, boards, priorities, statuses, SLAs, notes
- `references/company-module.md` — companies, contacts, configurations, sites
- `references/finance-module.md` — agreements, invoices, tax codes, billing
- `references/project-module.md` — projects, phases, project tickets
- `references/sales-module.md` — opportunities, activities, orders
- `references/time-module.md` — time entries, work types, work roles
- `references/system-module.md` — members, security roles, custom fields, callbacks
