# ConnectWise Manage — Finance Module Endpoints

Base: `/finance/`

---

## Agreements

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finance/agreements` | List/search agreements |
| POST | `/finance/agreements` | Create agreement |
| GET | `/finance/agreements/{id}` | Get agreement |
| PUT | `/finance/agreements/{id}` | Replace agreement |
| PATCH | `/finance/agreements/{id}` | Update agreement |
| DELETE | `/finance/agreements/{id}` | Delete agreement |
| GET | `/finance/agreements/{id}/additions` | List additions (line items) |
| POST | `/finance/agreements/{id}/additions` | Add line item |
| PATCH | `/finance/agreements/{id}/additions/{addId}` | Update addition |
| DELETE | `/finance/agreements/{id}/additions/{addId}` | Remove addition |
| GET | `/finance/agreements/{id}/adjustments` | List adjustments |
| POST | `/finance/agreements/{id}/adjustments` | Add adjustment |
| GET | `/finance/agreements/{id}/boardDefaults` | Board defaults |
| GET | `/finance/agreements/{id}/sites` | Agreement sites |
| GET | `/finance/agreements/{id}/workTypeExclusions` | Work type exclusions |

**Key agreement fields:**
```json
{
  "id": 10,
  "name": "Managed Services - Acme",
  "agreementType": {"name": "Managed Services"},
  "company": {"id": 123, "identifier": "acmecorp"},
  "contact": {"name": "Jane Smith"},
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "billAmount": 2500.00,
  "billCycleId": 1,
  "billOneTimeFlag": false,
  "cancelledFlag": false,
  "autoRenew": "NoAutoRenew",
  "invoiceTemplate": {"name": "Standard"},
  "taxCode": {"name": "Standard"}
}
```

---

## Invoices

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finance/invoices` | List/search invoices |
| POST | `/finance/invoices` | Create invoice |
| GET | `/finance/invoices/{id}` | Get invoice |
| PATCH | `/finance/invoices/{id}` | Update invoice |
| DELETE | `/finance/invoices/{id}` | Delete invoice |
| GET | `/finance/invoices/{id}/payments` | List payments |
| POST | `/finance/invoices/{id}/payments` | Record payment |
| GET | `/finance/invoices/taxableInvoiceCount` | Count taxable invoices |

**Key invoice fields:**
```json
{
  "id": 500,
  "invoiceNumber": "INV-00500",
  "type": "Standard",
  "status": {"name": "Unpaid"},
  "company": {"id": 123},
  "billToCompany": {"id": 123},
  "dueDate": "2024-07-01T00:00:00Z",
  "invoiceDate": "2024-06-01T00:00:00Z",
  "total": 2500.00,
  "balance": 2500.00,
  "taxTotal": 0.00
}
```

---

## Agreement Types

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finance/agreements/types` | List agreement types |
| GET | `/finance/agreements/types/{id}` | Get agreement type |
| GET | `/finance/agreements/types/{id}/workRoles` | Work roles for type |
| GET | `/finance/agreements/types/{id}/workTypeExclusions` | Exclusions |

---

## Tax Codes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finance/taxCodes` | List tax codes |
| GET | `/finance/taxCodes/{id}` | Get tax code |
| GET | `/finance/taxCodes/{id}/taxCodeLevels` | Tax code levels |
| GET | `/finance/taxCodes/{id}/taxCodeXRefs` | Cross-references |

---

## Billing

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finance/billingStatuses` | List billing statuses |
| GET | `/finance/billingTerms` | List billing terms |
| GET | `/finance/billingCycles` | List billing cycles |
| GET | `/finance/accountingBatches` | List accounting batches |
| POST | `/finance/accountingBatches` | Create batch |
| GET | `/finance/accountingBatches/{id}/entries` | List batch entries |
