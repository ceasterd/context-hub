# ConnectWise Manage — System Module Endpoints

Base: `/system/`

---

## Members

| Method | Path | Description |
|--------|------|-------------|
| GET | `/system/members` | List/search members |
| GET | `/system/members/{id}` | Get member by ID |
| GET | `/system/members/{memberIdentifier}` | Get member by identifier |
| PATCH | `/system/members/{id}` | Update member |
| GET | `/system/members/{id}/usages` | Member usages |
| GET | `/system/members/{id}/skills` | Member skills |
| GET | `/system/members/count` | Count members |
| GET | `/system/memberTypes` | List member types |

**Key member fields:**
```json
{
  "id": 7,
  "identifier": "jsmith",
  "firstName": "John",
  "lastName": "Smith",
  "title": "Network Engineer",
  "emailAddress": "jsmith@example.com",
  "officeEmail": "jsmith@example.com",
  "inactiveFlag": false,
  "securityRole": {"name": "Admin"},
  "defaultLocation": {"name": "Main"},
  "defaultDepartment": {"name": "Engineering"},
  "systemMemberFlag": false,
  "restrictLocationFlag": false
}
```

---

## Security Roles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/system/securityRoles` | List security roles |
| GET | `/system/securityRoles/{id}` | Get security role |
| GET | `/system/securityRoles/{id}/securityModules` | List modules in role |
| PATCH | `/system/securityRoles/{id}/securityModules/{moduleId}` | Update module permissions |

---

## Custom Fields (User Defined Fields)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/system/userDefinedFields` | List all custom field definitions |
| POST | `/system/userDefinedFields` | Create custom field |
| GET | `/system/userDefinedFields/{id}` | Get custom field definition |
| PUT | `/system/userDefinedFields/{id}` | Replace custom field |
| PATCH | `/system/userDefinedFields/{id}` | Update custom field |
| DELETE | `/system/userDefinedFields/{id}` | Delete custom field |

---

## Callbacks (Webhooks)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/system/callbacks` | List callbacks |
| POST | `/system/callbacks` | Create callback |
| GET | `/system/callbacks/{id}` | Get callback |
| PATCH | `/system/callbacks/{id}` | Update callback |
| DELETE | `/system/callbacks/{id}` | Delete callback |

---

## Reports

| Method | Path | Description |
|--------|------|-------------|
| GET | `/system/reports` | List available reports |
| GET | `/system/reports/{reportName}` | Get report schema |
| GET | `/system/reports/{reportName}` | Run report (use `columns` + `conditions` params) |

```python
# Run a report
r = requests.get(f"{BASE_URL}/system/reports/Service",
                 headers=headers,
                 params={"columns": "id,summary,status,board",
                         "conditions": "closedFlag = False",
                         "pageSize": 1000})
rows = r.json()
```

---

## Locations & Departments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/system/locations` | List locations |
| GET | `/system/locations/{id}` | Get location |
| GET | `/system/departments` | List departments |
| GET | `/system/departments/{id}` | Get department |

---

## Setup Tables

| Method | Path | Description |
|--------|------|-------------|
| GET | `/system/standardNotes` | Standard notes |
| GET | `/system/skills` | Skills list |
| GET | `/system/skillCategories` | Skill categories |
| GET | `/system/timeZones` | Time zones |
| GET | `/system/currencies` | Currencies |
| GET | `/system/audittrail` | Audit trail (use conditions to filter by `type` and `id`) |

---

## Info

| Method | Path | Description |
|--------|------|-------------|
| GET | `/system/info` | API version and server info |
