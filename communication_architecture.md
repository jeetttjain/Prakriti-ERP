# Communication Engine Architecture — Technical Blueprint

## 1. System Topology Diagram

```mermaid
flowchart TD
    A[ERP Business Modules: Orders/Invoices/Payments] -->|1. Dispatch Communication Request| B[notificationRouter.js]
    B -->|2. Check Target Preferences & Policies| C[CommunicationPreference & Policy Models]
    B -->|3. Render Subject & Body| D[templateEngine.js]
    B -->|4. Generate Attachments| E[attachmentEngine.js]
    B -->|5. Create Outbox Message| F[CommunicationMessage Model]
    F -->|6. Execute Failover Delivery| G[deliveryEngine.js & providerRegistry.js]
    G -->|7. Provider API Integration| H[WhatsApp / Email / SMS Providers]
```

---

## 2. Omnichannel Conversation Threading
Messages are automatically assigned to an entity conversation (`CommunicationConversation`). Future replies or follow-up notifications extend the timeline seamlessly.

---

## 3. Provider Failover Mechanism
If the primary provider fails, `deliveryEngine` steps through registered providers for that channel before triggering a fallback channel.
