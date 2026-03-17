# ConnectWise Manage — Sales Module Endpoints

Base: `/sales/`

---

## Opportunities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sales/opportunities` | List/search opportunities |
| POST | `/sales/opportunities` | Create opportunity |
| GET | `/sales/opportunities/{id}` | Get opportunity |
| PUT | `/sales/opportunities/{id}` | Replace opportunity |
| PATCH | `/sales/opportunities/{id}` | Update opportunity |
| DELETE | `/sales/opportunities/{id}` | Delete opportunity |
| POST | `/sales/opportunities/{id}/convertToAgreement` | Convert to agreement |
| POST | `/sales/opportunities/{id}/convertToProject` | Convert to project |
| POST | `/sales/opportunities/{id}/convertToServiceTicket` | Convert to ticket |
| GET | `/sales/opportunities/{id}/contacts` | List opportunity contacts |
| POST | `/sales/opportunities/{id}/contacts` | Add contact |
| GET | `/sales/opportunities/{id}/notes` | List notes |
| POST | `/sales/opportunities/{id}/notes` | Add note |
| GET | `/sales/opportunities/{id}/forecasts` | List forecast items |
| GET | `/sales/opportunities/{id}/teamMembers` | List team members |

**Key opportunity fields:**
```json
{
  "id": 300,
  "name": "Network Refresh Proposal",
  "company": {"id": 123},
  "contact": {"name": "Jane Smith"},
  "stage": {"name": "Proposal"},
  "probability": {"name": "50%"},
  "closeDate": "2024-07-31T00:00:00Z",
  "forecastAmount": 15000.00,
  "primarySalesRep": {"identifier": "jsmith"},
  "status": {"name": "Open"},
  "type": {"name": "New Business"},
  "source": {"name": "Referral"},
  "customFields": []
}
```

---

## Activities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sales/activities` | List/search activities |
| POST | `/sales/activities` | Create activity |
| GET | `/sales/activities/{id}` | Get activity |
| PATCH | `/sales/activities/{id}` | Update activity |
| DELETE | `/sales/activities/{id}` | Delete activity |

---

## Orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sales/orders` | List/search orders |
| POST | `/sales/orders` | Create order |
| GET | `/sales/orders/{id}` | Get order |
| PATCH | `/sales/orders/{id}` | Update order |
| DELETE | `/sales/orders/{id}` | Delete order |
| GET | `/sales/orders/{id}/products` | List order products |
| POST | `/sales/orders/{id}/products` | Add product |

---

## Sales Configuration

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sales/stages` | List opportunity stages |
| GET | `/sales/probabilities` | List probability levels |
| GET | `/sales/activities/statuses` | List activity statuses |
| GET | `/sales/activities/types` | List activity types |
| GET | `/sales/opportunities/ratings` | List ratings |
| GET | `/sales/opportunities/types` | List opportunity types |
| GET | `/sales/opportunities/statuses` | List opportunity statuses |
