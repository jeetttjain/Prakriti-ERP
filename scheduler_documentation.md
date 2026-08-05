# Enterprise Scheduler Engine — Documentation

## Scheduler Overview
The Scheduler Engine (`server/src/core/scheduler/schedulerEngine.js`) handles cron expressions, one-time jobs, and recurring schedules while logging complete execution history to MongoDB (`SchedulerHistory` collection).

---

## Capabilities
- **Cron Expressions**: Supports standard 5-part cron syntax (e.g. `0 0 * * *` for daily midnight).
- **Timezone Support**: UTC & Asia/Kolkata timezone awareness.
- **Controls**: Full runtime Pause, Resume, and Cancel API endpoints.
- **History Logging**: Persists `startedAt`, `completedAt`, `duration`, `result`, `error`, and `retryCount`.
