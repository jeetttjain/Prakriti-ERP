# Enterprise Business Intelligence Module — Documentation

## Executive Summary
Phase 7.2 delivers a production-grade, rule-based Business Intelligence (BI) Engine for Prakriti ERP. It transforms operational MongoDB transactional data across Sales, Inventory, Customers, Suppliers, Finance, and Procurement into structured BI metrics, risk scorecards, and actionable recommendations.

---

## Architecture Principles
1. **Rule-Based Engine**: Pure statistical analysis and rule evaluator functions — zero LLM or black-box dependencies.
2. **Pluggable Architecture**: Modular rule definitions under `server/src/utils/businessRules/` that can be extended without modifying core services.
3. **Database-Backed Lifecycle**: Recommendations and historical Health Score snapshots persisted in MongoDB (`Recommendation.js` and `BusinessHealthSnapshot.js`).
4. **AI-Ready Payload Schema**: Standardized JSON output structures (`recId`, `category`, `severity`, `title`, `suggestedAction`, `estimatedImpact`, `navigationTarget`) consumable by future AI modules, WhatsApp bots, and mobile apps.

---

## Intelligence Modules Overview

| Module | Core Analytics & Indicators Computed |
| :--- | :--- |
| **Sales Intelligence** | Realized sales today/week/month, AOV, peak ordering hours, sales velocity, top categories & products. |
| **Inventory Intelligence** | Low stock depletion days, dead stock value (30+ days idle), inventory turnover ratio, recommended reorder quantities. |
| **Customer Intelligence** | Customer Lifetime Value (CLV), churn risk count, repeat customer %, inactivity alert thresholds. |
| **Supplier Intelligence** | Vendor lead time hours, on-time delivery rate %, delayed shipment alerts, purchase volume ratings. |
| **Financial Intelligence** | Gross profit, net margin %, collection efficiency %, overdue receivables, revenue leakage indicators. |
| **Purchase Intelligence** | Purchase order counts, most purchased SKUs, bulk procurement cost optimization opportunities. |
