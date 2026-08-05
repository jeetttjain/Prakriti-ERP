# Distributed Tracing Architecture — Specification

## Span Lifecycle (`TraceSpan.js`)

```
[ Request Entry ] ──► [ startSpan(operationName) ] ──► (Generate TraceId & SpanId)
                                                               │
                                                       (Execute Request)
                                                               │
                                                               ▼
                                                     [ endSpan(status, tags) ] ──► (Store Duration Ms)
```

---

## Span Schema

```typescript
interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  correlationId?: string;
  operationName: string;
  module: string;
  durationMs: number;
  status: 'OK' | 'ERROR';
  tags: Record<string, any>;
}
```
