# Enterprise Communication Platform Architecture — Full Technical Blueprint

## 1. Executive Summary
Phase 7.3B establishes the provider-agnostic Communication Platform for Prakriti ERP. No ERP module directly communicates with third-party APIs — all messages flow through the central Communication Router.

---

## 2. Omnichannel Conversation Thread Model
Conversations group all customer/user communications under a single `conversationId` tied to an ERP entity (`Order`, `Invoice`, `Payment`).

```typescript
interface CommunicationConversation {
  conversationId: string;
  entityType: 'Order' | 'Invoice' | 'Payment' | 'Customer' | 'Supplier' | 'System';
  entityId: string;
  customerName?: string;
  customerContact: string;
  status: 'Active' | 'Closed' | 'Archived';
  assignedTo: string;
  channelHistory: string[];
  lastMessageAt: Date;
}
```

---

## 3. Dynamic Channel Policies & User Preference Inheritance
Notification Routing evaluates preferences in hierarchical order:
1. Category Policy Overrides (`CommunicationPolicy` collection)
2. Target Entity Preferences (`CommunicationPreference` collection)
3. Default Channel Hierarchy (`WhatsApp` $\rightarrow$ `Email` $\rightarrow$ `SMS` $\rightarrow$ `In-App`)

---

## 4. Future AI & Automation System Control
- **AI Extensions**: Payload structures support direct integration with future AI auto-translation, best send-time recommendations, and conversation summarizers.
- **System Control Flags**: State controls allow enabling, disabling, or putting providers and channels in maintenance mode via configuration.
