# Business Intelligence & Recommendation Engine — API Reference

## Authentication & Security
All `/api/bi/*` endpoints require standard JWT session header `Authorization: Bearer <token>` and are restricted to `Owner`, `Admin`, and `Manager` roles. Audit logs are recorded per access.

---

## Endpoint Specifications

### 1. `GET /api/bi/overview`
Returns composite Business Health Score (0-100), active recommendation alerts, and core summary metrics.

### 2. `GET /api/bi/recommendations`
Returns active and historical recommendations.
- **Filters**: `category`, `severity`, `status`

### 3. `GET /api/bi/sales`
Returns sales intelligence, AOV, peak ordering hours, and 14-day sales trend.

### 4. `GET /api/bi/inventory`
Returns inventory valuation, low stock items, dead stock value, and turnover ratio.

### 5. `GET /api/bi/customers`
Returns customer intelligence, top high-value accounts, repeat %, and churn warnings.

### 6. `GET /api/bi/suppliers`
Returns supplier lead time hours, on-time delivery %, and vendor rankings.

### 7. `GET /api/bi/finance`
Returns gross profit, net margin %, collection efficiency %, and overdue receivables.

### 8. `GET /api/bi/purchases`
Returns procurement trends, most purchased SKUs, and cost optimization savings.

### 9. `GET /api/bi/health`
Returns composite Business Health Score (0-100) and sub-scores.

### 10. `POST /api/bi/recommendation/:id/resolve`
Transitions recommendation status to `Resolved`. Accepts `{ resolutionNotes }`.

### 11. `POST /api/bi/recommendation/:id/archive`
Transitions recommendation status to `Archived`.
