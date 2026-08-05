# Executive Analytics & Business Intelligence Dashboard — API Documentation

## Authentication & Authorization
All endpoints require an active JWT session token via `Authorization: Bearer <token>` or cookie header. Access is restricted to `Owner`, `Admin`, and `Manager` roles.

---

## REST API Endpoints

### 1. `GET /api/dashboard/overview`
Returns high-level business counts, financial revenue, orders, inventory valuation, and cash flow summary.
- **Query Parameters**: `timeframe`, `startDate`, `endDate`, `branchId`, `warehouseId`, `categoryId`
- **Response Format**:
```json
{
  "success": true,
  "data": {
    "revenue": 1250000,
    "todayRevenue": 45000,
    "monthlyRevenue": 450000,
    "orders": 1420,
    "todayOrders": 32,
    "pendingOrders": 12,
    "completedOrders": 1390,
    "totalCustomers": 580,
    "activeCustomers": 540,
    "inventoryValue": 890000,
    "pendingPayments": 120000,
    "receivedPayments": 1130000,
    "profit": 360000,
    "netMargin": 28.8,
    "growthPercentage": 14.5
  }
}
```

### 2. `GET /api/dashboard/kpis`
Consumes the reusable BI KPI Engine for deeper performance ratios.
- **Query Parameters**: Same global filters
- **Response Format**:
```json
{
  "success": true,
  "data": {
    "momRevenueGrowthPct": 14.5,
    "yoyRevenueGrowthPct": 32.1,
    "averageOrderValue": 880.28,
    "averagePurchaseValue": 2450.00,
    "grossMarginPct": 35.2,
    "repeatCustomerPct": 78.4
  }
}
```

### 3. `GET /api/dashboard/charts`
Returns pre-aggregated dataset arrays for frontend visualization without client calculations.
- **Response Format**: `monthlySales`, `categoryDistribution`, `topSellingProducts`, `topCustomers`, `topSuppliers`, `paymentTrend`, `purchaseTrend`.

### 4. `GET /api/dashboard/activity`
Returns the 5 most recent orders, payments, purchases, customer registrations, logins, and audit logs.

### 5. `GET /api/dashboard/alerts`
Returns low stock warnings, out-of-stock items, overdue payment dues, and inactive customer notices.

### 6. `GET /api/dashboard/health`
Returns live infrastructure metrics: database latency ping (ms), API server uptime, scheduler status, RSS memory MB, and CPU cores.

### 7. `GET /api/dashboard/preferences` & `PUT /api/dashboard/preferences`
Gets and updates the authenticated user's DB dashboard layout preferences.

### 8. `POST /api/dashboard/cache/clear`
Flushes the server-side in-memory analytics cache.
