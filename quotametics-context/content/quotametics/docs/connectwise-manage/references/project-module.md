# ConnectWise Manage — Project Module Endpoints

Base: `/project/`

---

## Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/project/projects` | List/search projects |
| POST | `/project/projects` | Create project |
| GET | `/project/projects/{id}` | Get project |
| PUT | `/project/projects/{id}` | Replace project |
| PATCH | `/project/projects/{id}` | Update project |
| DELETE | `/project/projects/{id}` | Delete project |
| GET | `/project/projects/{id}/phases` | List phases |
| POST | `/project/projects/{id}/phases` | Create phase |
| GET | `/project/projects/{id}/phases/{phaseId}` | Get phase |
| PATCH | `/project/projects/{id}/phases/{phaseId}` | Update phase |
| DELETE | `/project/projects/{id}/phases/{phaseId}` | Delete phase |
| GET | `/project/projects/{id}/teamMembers` | List team members |
| POST | `/project/projects/{id}/teamMembers` | Add team member |
| DELETE | `/project/projects/{id}/teamMembers/{memberId}` | Remove team member |
| GET | `/project/projects/{id}/notes` | List project notes |
| POST | `/project/projects/{id}/notes` | Add note |

**Key project fields:**
```json
{
  "id": 200,
  "name": "Network Upgrade Q3",
  "status": {"name": "Open"},
  "company": {"id": 123},
  "contact": {"name": "Jane Smith"},
  "manager": {"identifier": "jsmith"},
  "board": {"name": "Projects"},
  "estimatedStart": "2024-07-01T00:00:00Z",
  "estimatedEnd": "2024-09-30T00:00:00Z",
  "estimatedHours": 80.0,
  "actualHours": 0.0,
  "percentComplete": 0.0,
  "billingMethod": "FixedFee",
  "billingAmount": 12000.00,
  "description": ""
}
```

---

## Project Tickets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/project/tickets` | List/search project tickets |
| POST | `/project/tickets` | Create project ticket |
| GET | `/project/tickets/{id}` | Get project ticket |
| PATCH | `/project/tickets/{id}` | Update project ticket |
| DELETE | `/project/tickets/{id}` | Delete project ticket |
| GET | `/project/tickets/{id}/notes` | List notes |
| POST | `/project/tickets/{id}/notes` | Add note |
| GET | `/project/tickets/{id}/timeEntries` | List time entries |
| GET | `/project/tickets/{id}/tasks` | List tasks |

---

## Project Statuses & Types

| Method | Path | Description |
|--------|------|-------------|
| GET | `/project/projectStatuses` | List project statuses |
| GET | `/project/projectTypes` | List project types |
| GET | `/project/boards` | List project boards |
| GET | `/project/boards/{id}/statuses` | Statuses for board |
| GET | `/project/billingRates` | List billing rates |
