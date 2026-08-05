# Delivery Engine & Message Lifecycle — Documentation

## Message Lifecycle States

```
[ Draft ] ──► [ Scheduled ] ──► [ Queued ] ──► [ Sending ] ──► [ Delivered ] ──► [ Read ]
                                                  │
                                                  ▼
                                              [ Failed ] ──► [ Retrying ] ──► [ Cancelled / DLQ ]
```

---

## Exponential Backoff Retry Policy
1. Attempt 1: Immediate dispatch.
2. Attempt 2: Retry after 60 seconds.
3. Attempt 3: Retry after 300 seconds.
4. Exceeded: Move to `Failed` status and trigger fallback channel.
