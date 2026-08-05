# Priority Job Queue & Distributed Locks — Documentation

## Subsystem Overview
The Job Queue (`server/src/core/queue/jobQueue.js`) manages asynchronous job execution across High, Normal, and Low priority queues backed by MongoDB (`AutomationJob` collection).

---

## Supported Job Types
- **Immediate**: Executed immediately upon event emit.
- **Delayed**: Held for specified delay period.
- **Scheduled**: Executed at specific scheduled time.
- **Recurring**: Executed periodically on recurring schedule.
- **Background**: Low-priority background processing.

---

## Distributed Lock Manager (`lockManager.js`)
Prevents concurrent execution of duplicate jobs or workflow instances across scaling nodes using resource key TTL locks (`JobLock`, `WorkflowLock`, `SchedulerLock`).

---

## Dead Letter Queue (DLQ)
Jobs exceeding `maxRetries` (default: 3) are automatically transitioned to `DEAD` status for manual inspection and retry (`PATCH /api/automation/job/:id/retry`).
