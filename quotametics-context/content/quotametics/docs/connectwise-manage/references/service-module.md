# ConnectWise Manage — Service Module Endpoints

Base: `/service/`

---

## Tickets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/service/tickets` | List/search tickets |
| POST | `/service/tickets` | Create ticket |
| GET | `/service/tickets/{id}` | Get ticket by ID |
| PUT | `/service/tickets/{id}` | Replace ticket |
| PATCH | `/service/tickets/{id}` | Update ticket fields |
| DELETE | `/service/tickets/{id}` | Delete ticket |
| POST | `/service/tickets/search` | Search with long conditions in body |
| GET | `/service/tickets/{id}/notes` | List ticket notes |
| POST | `/service/tickets/{id}/notes` | Add note |
| GET | `/service/tickets/{id}/notes/{noteId}` | Get note |
| PATCH | `/service/tickets/{id}/notes/{noteId}` | Update note |
| DELETE | `/service/tickets/{id}/notes/{noteId}` | Delete note |
| GET | `/service/tickets/{id}/timeEntries` | List time entries on ticket |
| GET | `/service/tickets/{id}/tasks` | List tasks |
| POST | `/service/tickets/{id}/tasks` | Create task |
| PATCH | `/service/tickets/{id}/tasks/{taskId}` | Update task |
| DELETE | `/service/tickets/{id}/tasks/{taskId}` | Delete task |
| GET | `/service/tickets/{id}/documents` | List attachments |
| POST | `/service/tickets/{id}/documents` | Attach document |
| GET | `/service/tickets/{id}/configurations` | List linked configurations |
| POST | `/service/tickets/{id}/configurations` | Link configuration |
| DELETE | `/service/tickets/{id}/configurations/{configId}` | Unlink configuration |
| GET | `/service/tickets/{id}/products` | List products on ticket |
| GET | `/service/tickets/{id}/scheduleEntries` | List schedule entries |
| GET | `/service/tickets/{id}/activitiesAssociations` | List activity links |

**Key ticket fields:**
```json
{
  "id": 5000,
  "summary": "Cannot connect to VPN",
  "board": {"id": 1, "name": "Helpdesk"},
  "status": {"id": 1, "name": "New"},
  "priority": {"id": 3, "name": "High"},
  "company": {"id": 123, "identifier": "acmecorp", "name": "Acme Corp"},
  "contact": {"id": 45, "name": "Jane Smith"},
  "owner": {"id": 7, "identifier": "jsmith"},
  "type": {"id": 2, "name": "Request"},
  "subType": {"name": "Software"},
  "item": {"name": "Application"},
  "team": {"name": "Tier 1"},
  "severity": "Medium",
  "impact": "Medium",
  "automaticEmailContactFlag": true,
  "automaticEmailResourceFlag": true,
  "closedFlag": false,
  "dateEntered": "2024-06-01T09:00:00Z",
  "lastUpdated": "2024-06-01T10:00:00Z",
  "requiredDate": "2024-06-02T17:00:00Z",
  "customFields": []
}
```

**Key note fields:**
```json
{
  "text": "Investigated the issue...",
  "detailDescriptionFlag": false,
  "internalAnalysisFlag": true,
  "resolutionFlag": false,
  "member": {"identifier": "jsmith"},
  "contact": null,
  "timeStart": null,
  "timeEnd": null
}
```

---

## Boards

| Method | Path | Description |
|--------|------|-------------|
| GET | `/service/boards` | List all boards |
| GET | `/service/boards/{id}` | Get board |
| GET | `/service/boards/{id}/statuses` | List statuses for a board |
| GET | `/service/boards/{id}/types` | List types for a board |
| GET | `/service/boards/{id}/subtypes` | List subtypes |
| GET | `/service/boards/{id}/items` | List items |
| GET | `/service/boards/{id}/teams` | List teams |

---

## Priorities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/service/priorities` | List priorities |
| GET | `/service/priorities/{id}` | Get priority |

---

## SLAs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/service/SLAs` | List SLAs |
| GET | `/service/SLAs/{id}` | Get SLA |
| GET | `/service/SLAs/{id}/priorities` | Get SLA priority windows |

---

## Surveys

| Method | Path | Description |
|--------|------|-------------|
| GET | `/service/surveys` | List surveys |
| GET | `/service/surveyResults` | List survey results |

---

## Impact/Severity

| Method | Path | Description |
|--------|------|-------------|
| GET | `/service/impacts` | List impact values |
| GET | `/service/severities` | List severity values |

---

## Sources & Location

| Method | Path | Description |
|--------|------|-------------|
| GET | `/service/sources` | List ticket sources |
| GET | `/service/locations` | List service locations |
| GET | `/service/locations/{id}/departments` | List departments at location |
