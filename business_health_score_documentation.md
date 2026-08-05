# Business Health Score Algorithm — Documentation

## Executive Overview
The Business Health Score is a composite numerical index ($0 - 100$) reflecting total operational and financial stability.

---

## Weighted Rating Formula

$$\text{HealthScore} = \sum_{i} \left( \text{SubScore}_i \times w_i \right)$$

### Operational Sub-Scores & Weightages (`server/src/config/biThresholds.js`)

| Sub-Score Dimension | Weightage ($w_i$) | Key Target Indicators Evaluated |
| :--- | :---: | :--- |
| **Sales Score** | **25%** | MoM revenue growth %, target sales volume. |
| **Finance Score** | **25%** | Collection efficiency %, overdue ratio %. |
| **Inventory Score** | **20%** | Low stock counts, out-of-stock items, dead stock. |
| **Customer Score** | **15%** | Repeat customer %, churn rate. |
| **Supplier Score** | **10%** | On-time delivery %, lead time stability. |
| **Operations Score** | **5%** | Fulfillment velocity %, order status ratio. |

---

## Rating Grade Boundaries
- **Score 85 - 100**: Grade **A+** (Optimal Performance)
- **Score 75 - 84**: Grade **A** (Healthy Operations)
- **Score 60 - 74**: Grade **B** (Moderate Risk Warnings)
- **Score < 60**: Grade **C** (Critical Action Required)
