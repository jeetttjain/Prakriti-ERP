# Enterprise Communication Engine — Documentation

## Executive Overview
Phase 7.3B delivers the centralized Enterprise Communication Platform for Prakriti ERP under `server/src/core/communication/`. No ERP business module sends messages directly — all communication requests are routed through this engine.

---

## Key Subsystems
1. **Omnichannel Conversation Engine**: Groups messages into threads (`CommunicationConversation`) with a unified timeline across WhatsApp, Email, SMS, Push, and In-App channels.
2. **Provider Failover Chain**: Automatically fails over (Primary Provider $\rightarrow$ Secondary Provider $\rightarrow$ Fallback Channel) without manual intervention.
3. **Template Engine**: Multi-lingual templates supporting variable substitution, locale currency/date formatting, conditional rendering, and versioning.
4. **Hierarchical Preferences & Policy**: Resolves preferences across Global, Branch, Customer, Employee, and Supplier levels with channel policy overrides.
5. **Delivery Engine**: Manages message lifecycle states (`Draft`, `Scheduled`, `Queued`, `Sending`, `Sent`, `Delivered`, `Read`, `Failed`, `Cancelled`), rate limits, and retries.
