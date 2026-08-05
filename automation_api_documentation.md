# Automation Core & Event Bus — API Reference

## Endpoints Summary (`/api/automation/*`)

### 1. `GET /api/automation/events`
Returns recent published Event Bus logs.

### 2. `POST /api/automation/events/replay`
Replays events matching filter parameters (`eventId`, `module`, `correlationId`, `startDate`, `endDate`).

### 3. `GET /api/automation/jobs`
Returns queued, running, completed, and dead jobs.

### 4. `GET /api/automation/history`
Returns scheduler execution history logs.

### 5. `GET /api/automation/workflows`
Returns registered workflow definitions.

### 6. `GET /api/automation/templates`
Returns pre-packaged clonable workflow templates.

### 7. `GET /api/automation/metrics`
Returns live telemetry (running/queued/completed/failed/dead jobs, success rate %, throughput, memory RSS).

### 8. `POST /api/automation/event`
Emits an event into the Event Bus.

### 9. `POST /api/automation/job`
Enqueues a new automation job.

### 10. `POST /api/automation/workflow`
Clones a workflow from a template.

### 11. `PATCH /api/automation/job/:id/pause` / `resume` / `retry` / `cancel`
Controls job lifecycle states.

### 12. `DELETE /api/automation/job/:id`
Deletes a job from the queue.
