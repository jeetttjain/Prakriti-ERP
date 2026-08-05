# Device Management & Trust Inspector — Specification

## Device Schema (`IdentityDevice.js`)

```typescript
interface IdentityDevice {
  deviceId: string;
  userCode: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  isTrusted: boolean;
  isBlocked: boolean;
  riskScore: number; // 0 to 100
  lastLoginAt: Date;
}
```

---

## Device Trust Controls
- `Trust Device`: Marks device as recognized, lowering risk score to baseline (10).
- `Block Device`: Immediately blocks logins from targeted device fingerprint.
- `Revocation`: Disconnects all active sessions associated with target device.
