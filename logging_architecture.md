# Logging Architecture — Technical Specification

## Subsystem Topology
Located under `server/src/core/observability/logging/loggerEngine.js` and `logMasker.js`.

---

## Log Schema (`SystemLog.js`)

```typescript
interface SystemLog {
  logId: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'FATAL';
  module: string;
  message: string;
  correlationId: string;
  traceId?: string;
  spanId?: string;
  userCode?: string;
  metadata: Record<string, any>;
  ipAddress?: string;
}
```

---

## PII & Secret Masking
`logMasker.js` inspects metadata keys and replaces sensitive values (`password`, `secret`, `token`, `key`) with `******** [REDACTED]` before writing to database or emitting events.
