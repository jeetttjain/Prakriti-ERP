# Metrics Architecture & Telemetry — Specification

## System Metrics Schema (`SystemMetric.js`)

```typescript
interface SystemMetric {
  metricId: string;
  category: 'CPU' | 'MEMORY' | 'DISK' | 'MONGODB' | 'API' | 'QUEUE';
  metricName: string;
  value: number;
  unit: string;
  metadata?: Record<string, any>;
}
```

---

## Telemetry Metrics Collected
- **Memory Usage %**: Node.js process & OS free memory.
- **CPU Load Average**: OS load average.
- **MongoDB Latency**: Database query execution time in milliseconds.
- **API Avg Response Time**: HTTP request latency in milliseconds.
