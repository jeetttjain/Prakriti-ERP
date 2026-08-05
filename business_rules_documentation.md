# Business Rules Engine — Documentation & Registry

## Business Rule Registry
All business rules are implemented under `server/src/utils/businessRules/` and evaluated via `ruleEngine.js`.

---

## Active Business Rules Specifications

### 1. `SALES_REVENUE_DROP`
- **Category**: Sales | **Severity**: Warning/Critical | **Priority**: High
- **Threshold**: Weekly revenue drop $\ge 10\%$ compared to previous 7 days.
- **Impact**: Quantifies revenue loss and suggests re-engagement campaigns.

### 2. `SALES_PEAK_HOURS`
- **Category**: Sales | **Severity**: Info | **Priority**: Low
- **Threshold**: Identifies hourly peak order concentration (e.g. 09:00 AM).
- **Impact**: Optimizes warehouse dispatch scheduling.

### 3. `INV_LOW_STOCK_DEPLETION`
- **Category**: Inventory | **Severity**: Critical/Warning | **Priority**: High
- **Threshold**: Stock level $\le$ reorder level or depleted within $\le 3$ days.
- **Impact**: Computes recommended reorder quantity and stockout revenue loss risk.

### 4. `INV_DEAD_STOCK_DETECTION`
- **Category**: Inventory | **Severity**: Warning | **Priority**: Medium
- **Threshold**: Zero movement for $\ge 30$ days.
- **Impact**: Calculates tied-up working capital amount and recommends clearance discounts.

### 5. `CUST_INACTIVITY_CHURN`
- **Category**: Customer | **Severity**: Warning | **Priority**: High
- **Threshold**: Inactivity $\ge 21$ days for high-value accounts.
- **Impact**: Flags customer LTV at risk and prompts sales outreach.

### 6. `FIN_OVERDUE_RECEIVABLES`
- **Category**: Finance | **Severity**: Critical | **Priority**: High
- **Threshold**: Unpaid dues past invoice due date.
- **Impact**: Highlights cash flow exposure and triggers recovery notifications.

### 7. `PURCHASE_COST_OPTIMIZATION`
- **Category**: Purchase | **Severity**: Info | **Priority**: Medium
- **Threshold**: Fragmented small-lot procurement in high-cost categories.
- **Impact**: Recommends supplier bulk order consolidation.
