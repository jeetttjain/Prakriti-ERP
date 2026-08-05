# Automation Core Architecture — Technical Blueprint

## 1. System Topology Diagram

```mermaid
flowchart TD
    A[ERP Modules: Orders/Billing/Inventory/User] -->|1. Emit Event| B[eventPublisher.js]
    B -->|2. Idempotency Check| C[EventLog Model]
    C -->|3. Notify| D[eventSubscriber.js]
    D -->|4. Dispatch to Listeners| E[listeners/*]
    E -->|5. Enqueue Action Job| F[jobQueue.js & lockManager.js]
    F -->|6. Execute Step Chain| G[workflowEngine.js]
    G -->|7. Webhooks / Plugins| H[webhookEngine.js & pluginRegistry.js]
```

---

## 2. Event Versioning & Replay
Events include `eventVersion` and `schemaVersion` for backward compatibility. Replay service (`eventReplay.js`) enables debugging and disaster recovery.

---

## 3. Distributed Locking & Idempotency
- **Idempotency**: MD5 key generation (`eventName_producer_entityId_timeBucket`) prevents duplicate execution.
- **Distributed Locks**: Resource key TTL locks (`lockManager.js`) prevent race conditions.

---

## 4. Extension Points for Future Plugins
Pluggable registry (`pluginRegistry.js`) allows future plugins (WhatsApp, Email, SMS, Razorpay, PhonePe, GST, AI Assistant) to register without modifying core code.
