# Lead Management & Intelligent Assignment Engine — Specification

## Lead Schema (`Lead.js` & `leadManager.js`)

```typescript
interface Lead {
  leadId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  leadSource: 'Website' | 'Referral' | 'Phone' | 'WhatsApp' | 'Campaign';
  leadScore: number; // 0 - 100
  confidenceScore: number;
  scoringFactors: string[];
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  assignedExecutiveCode: string;
}
```
