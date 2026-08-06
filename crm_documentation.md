# Enterprise CRM & Customer Experience Platform (ECXP) — Overview Documentation

## System Purpose
Phase 10 delivers the Enterprise CRM & Customer Experience Platform (ECXP) for Prakriti ERP under `server/src/core/crm/`. ECXP is the single source of truth for the complete customer lifecycle, including B2B/B2C Customer Master, Customer 360 Aggregation, Lead Management, Sales Opportunity Pipelines, Quotations with PDF/WhatsApp dispatch, Sales Visit Beat Plans with GPS check-ins, Customer Complaint SLA Resolution, Credit Control, Tiered Loyalty Programs, Centralized Activity Logging, Follow-up Reminders, Daily Sales Executive Tasks, Collection Management (Promise-To-Pay), EDP-Integrated Document Vault, and CRM Analytics.

---

## Core Capabilities
1. **Customer 360 Engine**: `customer360Engine.js` aggregates Customer Master, Credit Profile, Loyalty Tier, Health Score (0-100), Activities, Quotes, Complaints, Visits, and BI Recommendations into a single unified profile (`GET /api/crm/customer360/:customerCode`).
2. **Centralized Activity Engine & Timeline**: `activityEngine.js` logs every call, email, WhatsApp, visit, meeting, quote, order, invoice, payment, and complaint (`CustomerActivity.js`).
3. **Lead Management & Intelligent Assignment**: `leadManager.js` and `leadAssignmentEngine.js` handle lead capture, extensible lead scoring (factors, confidence %), and automated assignment (Round Robin, Territory, Least Loaded).
4. **Sales Opportunity Pipeline & Revenue Forecasting**: `opportunityEngine.js` and `salesForecastEngine.js` track opportunity stages, probability %, expected revenue, and pipeline value.
5. **Quotation Engine & Omnichannel Dispatch**: `quotationEngine.js` creates quotations, validates discount rules, calculates tax, dispatches via Phase 7.3B Communication Engine, and emits `QUOTATION_CREATED` into Phase 7.3A Event Bus.
6. **Sales Visit Beat Plans & GPS Check-Ins**: `visitManager.js` manages sales executive beat plans (`SalesVisit.js`), GPS coordinates, photo uploads, and visit outcomes (`CUSTOMER_VISIT`).
7. **Complaint SLA Center**: `complaintManager.js` manages customer complaints (`Complaint.js`), SLA hours, priority escalation, and resolution feedback (`COMPLAINT_RESOLVED`).
8. **Credit Control & Collection Management**: `creditControlEngine.js` enforces credit limits (`CreditProfile.js`), and `collectionEngine.js` manages Promise-To-Pay (PTP) settlements (`Collection.js`), automatically posting double-entry receipt ledgers to Phase 7.7 EFAP (`journalEngine.js`).
9. **Loyalty Program Engine**: `loyaltyEngine.js` calculates points, handles tier upgrades (Silver $\rightarrow$ Gold $\rightarrow$ Platinum), and tracks redemptions (`LOYALTY_UPDATED`).
10. **CRM Analytics**: `crmAnalytics.js` computes Lead Conversion %, Win Rate %, Pipeline Value, CLV, and Complaint Resolution %.
