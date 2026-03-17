# ConnectWise Manage — Time Module Endpoints

Base: `/time/`

---

## Time Entries

| Method | Path | Description |
|--------|------|-------------|
| GET | `/time/entries` | List/search time entries |
| POST | `/time/entries` | Create time entry |
| GET | `/time/entries/{id}` | Get time entry |
| PUT | `/time/entries/{id}` | Replace time entry |
| PATCH | `/time/entries/{id}` | Update time entry |
| DELETE | `/time/entries/{id}` | Delete time entry |

**Key time entry fields:**
```json
{
  "id": 700,
  "chargeToId": 5000,
  "chargeToType": "ServiceTicket",
  "member": {"identifier": "jsmith"},
  "locationId": 1,
  "businessUnitId": 1,
  "workType": {"name": "Remote"},
  "workRole": {"name": "Engineer"},
  "timeStart": "2024-06-01T09:00:00Z",
  "timeEnd":   "2024-06-01T10:30:00Z",
  "hoursDeducted": 0.0,
  "actualHours": 1.5,
  "billableOption": "Billable",
  "notes": "Investigated VPN connectivity issue.",
  "internalNotes": "",
  "hoursBilled": 1.5,
  "invoiceId": null
}
```

**chargeToType values:** `ServiceTicket`, `ProjectTicket`, `Activity`, `Agreement`

**billableOption values:** `Billable`, `DoNotBill`, `NoCharge`, `NoDefault`

---

## Work Types

| Method | Path | Description |
|--------|------|-------------|
| GET | `/time/workTypes` | List work types |
| GET | `/time/workTypes/{id}` | Get work type |

---

## Work Roles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/time/workRoles` | List work roles |
| GET | `/time/workRoles/{id}` | Get work role |

---

## Accruals

| Method | Path | Description |
|--------|------|-------------|
| GET | `/time/accruals` | List accruals |
| GET | `/time/accruals/{id}` | Get accrual |

---

## Time Periods

| Method | Path | Description |
|--------|------|-------------|
| GET | `/time/timePeriodSetups` | List time period setups |
| GET | `/time/timePeriodSetups/{id}/periods` | List periods in setup |
