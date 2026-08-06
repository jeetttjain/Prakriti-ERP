# Feature Flag Engine & Canary Rollout — Specification

## Feature Flag Schema (`FeatureFlag.js`)

```typescript
interface FeatureFlag {
  flagId: string;
  key: string; // e.g. "whatsapp_notifications"
  name: string;
  isEnabled: boolean;
  category: string;
  targeting: {
    branches: string[];
    roles: string[];
    canaryPercentage: number; // 0 - 100%
  };
}
```
