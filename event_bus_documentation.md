# Enterprise Event Bus & Event Registry — Documentation

## Architecture Principles
The Event Bus (`server/src/core/events/`) serves as the decoupled communication backbone of Prakriti ERP. No business module calls another module directly — all communication occurs via published Event Bus events.

---

## Event Schema Standard

```typescript
interface EventLog {
  eventId: string; // Unique Identifier (e.g. EVT-1785961600920-ozm9u)
  eventName: string; // Standard Event Name (e.g. ORDER_CREATED)
  eventVersion: string; // "1.0"
  schemaVersion: string; // "1.0"
  producerModule: string; // E.g. OrderModule
  consumerModules: string[]; // List of consuming listeners
  payload: object;
  timestamp: Date;
  createdBy: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  retryCount: number;
  executionStatus: 'PUBLISHED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD';
  correlationId: string;
  idempotencyKey: string;
}
```

---

## Event Registry (`eventRegistry.js`)
- `ORDER_CREATED`, `ORDER_UPDATED`, `ORDER_CANCELLED`
- `INVOICE_GENERATED`, `PAYMENT_RECEIVED`, `PAYMENT_FAILED`, `PAYMENT_OVERDUE`
- `PRODUCT_CREATED`, `INVENTORY_UPDATED`, `LOW_STOCK`
- `PURCHASE_CREATED`, `PURCHASE_APPROVED`, `SUPPLIER_ADDED`
- `CUSTOMER_REGISTERED`, `USER_LOGIN`, `USER_LOGOUT`, `ROLE_UPDATED`
- `BACKUP_COMPLETED`, `AUTOMATION_FAILED`, `AI_ANALYSIS_COMPLETED`, `SYSTEM_ERROR`

---

## Event Replay Subsystem
Supports replaying historical events via `POST /api/automation/events/replay` filtering by single event ID, date range, module, or correlation ID.
