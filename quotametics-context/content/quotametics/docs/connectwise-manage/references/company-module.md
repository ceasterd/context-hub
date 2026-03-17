# ConnectWise Manage — Company Module Endpoints

Base: `/company/`

---

## Companies

| Method | Path | Description |
|--------|------|-------------|
| GET | `/company/companies` | List/search companies |
| POST | `/company/companies` | Create company |
| GET | `/company/companies/{id}` | Get company |
| PUT | `/company/companies/{id}` | Replace company |
| PATCH | `/company/companies/{id}` | Update company fields |
| DELETE | `/company/companies/{id}` | Delete company |
| GET | `/company/companies/{id}/contacts` | List contacts at company |
| GET | `/company/companies/{id}/configurations` | List configurations at company |
| GET | `/company/companies/{id}/sites` | List sites |
| GET | `/company/companies/{id}/notes` | List company notes |
| POST | `/company/companies/{id}/notes` | Add note |
| GET | `/company/companies/{id}/statusNotes` | List status notes |
| GET | `/company/companies/{id}/teams` | List team members |
| GET | `/company/companies/{id}/managementSummaries` | Management summary |
| GET | `/company/companies/{id}/documents` | List documents |
| GET | `/company/companies/{id}/tracks` | List tracks |
| GET | `/company/companies/{id}/customStatusNotes` | Custom status notes |

**Key company fields:**
```json
{
  "id": 123,
  "identifier": "acmecorp",
  "name": "Acme Corp",
  "status": {"name": "Active"},
  "type": {"name": "Client"},
  "phoneNumber": "555-0100",
  "faxNumber": "",
  "website": "https://acmecorp.example.com",
  "addressLine1": "123 Main St",
  "city": "Springfield",
  "state": {"identifier": "IL"},
  "zip": "62701",
  "country": {"name": "United States"},
  "territory": {"name": "Central"},
  "market": {"name": "Technology"},
  "accountNumber": "",
  "taxCode": {"name": "Standard"},
  "billToCompany": null,
  "defaultContact": {"name": "Jane Smith"},
  "customFields": []
}
```

---

## Contacts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/company/contacts` | List/search contacts |
| POST | `/company/contacts` | Create contact |
| GET | `/company/contacts/{id}` | Get contact |
| PUT | `/company/contacts/{id}` | Replace contact |
| PATCH | `/company/contacts/{id}` | Update contact fields |
| DELETE | `/company/contacts/{id}` | Delete contact |
| GET | `/company/contacts/{id}/communications` | List communication methods |
| POST | `/company/contacts/{id}/communications` | Add communication method |
| PATCH | `/company/contacts/{id}/communications/{commId}` | Update communication |
| DELETE | `/company/contacts/{id}/communications/{commId}` | Delete communication |
| GET | `/company/contacts/{id}/notes` | List notes |
| POST | `/company/contacts/{id}/notes` | Add note |
| GET | `/company/contacts/{id}/tracks` | List tracks |
| GET | `/company/contacts/{id}/documents` | List documents |
| GET | `/company/contacts/{id}/relationships` | List company relationships |
| GET | `/company/contactRelationships` | List relationship types |

**Key contact fields:**
```json
{
  "id": 45,
  "firstName": "Jane",
  "lastName": "Smith",
  "title": "IT Manager",
  "company": {"id": 123, "identifier": "acmecorp"},
  "site": {"name": "Main Office"},
  "inactiveFlag": false,
  "communicationItems": [
    {"type": {"name": "Email"}, "value": "jane@acmecorp.example.com", "defaultFlag": true},
    {"type": {"name": "Direct"}, "value": "555-0101", "defaultFlag": false}
  ],
  "customFields": []
}
```

---

## Configurations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/company/configurations` | List/search configurations |
| POST | `/company/configurations` | Create configuration |
| GET | `/company/configurations/{id}` | Get configuration |
| PUT | `/company/configurations/{id}` | Replace configuration |
| PATCH | `/company/configurations/{id}` | Update configuration |
| DELETE | `/company/configurations/{id}` | Delete configuration |
| GET | `/company/configurations/{id}/questions` | Get configuration questions |
| GET | `/company/configurations/types` | List configuration types |
| GET | `/company/configurations/types/{id}` | Get configuration type |
| GET | `/company/configurations/types/{id}/questions` | Questions for type |
| GET | `/company/configurations/statusIndicators` | List status indicators |

---

## Sites

| Method | Path | Description |
|--------|------|-------------|
| GET | `/company/companies/{id}/sites` | List sites for company |
| POST | `/company/companies/{id}/sites` | Create site |
| PATCH | `/company/companies/{id}/sites/{siteId}` | Update site |
| DELETE | `/company/companies/{id}/sites/{siteId}` | Delete site |

---

## Communication Types

| Method | Path | Description |
|--------|------|-------------|
| GET | `/company/communicationTypes` | List communication types (Email, Phone, etc.) |
| GET | `/company/communicationTypes/{id}` | Get communication type |

---

## Company Types & Statuses

| Method | Path | Description |
|--------|------|-------------|
| GET | `/company/companies/statuses` | List company statuses |
| GET | `/company/companies/types` | List company types |
| GET | `/company/companies/customStatusNotes` | Custom status note types |
