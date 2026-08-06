# Enterprise CRM Platform — API Reference

## Endpoints Specifications (`/api/crm/*`)

### 1. `GET /api/crm/customers`
Returns B2B/B2C customer accounts directory.

### 2. `GET /api/crm/customer360/:customerCode`
Aggregates unified Customer 360 profile (Master, Credit, Loyalty, Health Score 0-100, Activities, Quotes, Complaints, Visits).

### 3. `GET /api/crm/leads`
Returns sales lead pipeline.

### 4. `GET /api/crm/opportunities`
Returns sales opportunity pipeline.

### 5. `GET /api/crm/quotations`
Returns quotations directory.

### 6. `GET /api/crm/activities`
Returns centralized CRM activity stream.

### 7. `GET /api/crm/followups`
Returns follow-up reminders.

### 8. `GET /api/crm/tasks`
Returns daily sales executive work tasks.

### 9. `GET /api/crm/visits`
Returns sales visit beat plans.

### 10. `GET /api/crm/complaints`
Returns customer complaints and SLA resolution statuses.

### 11. `GET /api/crm/credit`
Returns customer credit profiles.

### 12. `GET /api/crm/collections`
Returns collection receipts and Promise-To-Pay (PTP) records.

### 13. `GET /api/crm/forecast`
Generates sales revenue forecast.

### 14. `GET /api/crm/health/:customerCode`
Returns Customer Health Score (0-100).

### 15. `GET /api/crm/analytics`
Generates CRM performance metrics (Lead conversion %, win rate %, pipeline value).

### 16. `POST /api/crm/customer`
Creates new customer account and default credit/loyalty profiles.

### 17. `POST /api/crm/lead`
Captures new sales lead and triggers intelligent assignment.

### 18. `POST /api/crm/lead/convert`
Converts qualified lead into Customer Account.

### 19. `POST /api/crm/quotation`
Issues sales quotation and dispatches via Phase 7.3B Communication Engine.

### 20. `POST /api/crm/visit`
Logs sales visit beat plan and GPS check-in.

### 21. `POST /api/crm/complaint`
Logs customer complaint and SLA tracking.

### 22. `POST /api/crm/collection`
Records payment receipt and posts double-entry journal to Phase 7.7 EFAP.
