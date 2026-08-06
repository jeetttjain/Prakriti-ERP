# System Control Engine — API Reference

## Endpoints Specifications (`/api/system/*`)

### 1. `GET /api/system/modules`
Returns list of registered ERP modules and DAG dependencies.

### 2. `GET /api/system/services`
Returns module service groups.

### 3. `GET /api/system/flags`
Returns runtime feature flags and canary rollout percentages.

### 4. `GET /api/system/configuration`
Returns system configurations.

### 5. `GET /api/system/maintenance`
Returns active maintenance windows.

### 6. `GET /api/system/snapshots`
Returns system state snapshots.

### 7. `GET /api/system/timeline`
Returns operational timeline events.

### 8. `POST /api/system/module/start`
Starts a subsystem module.

### 9. `POST /api/system/module/stop`
Stops a subsystem module after DAG dependency validation.

### 10. `POST /api/system/module/restart`
Restarts a subsystem module.

### 11. `POST /api/system/feature/enable`
Enables a feature flag.

### 12. `POST /api/system/feature/disable`
Disables a feature flag.

### 13. `POST /api/system/maintenance/start`
Activates maintenance mode.

### 14. `POST /api/system/maintenance/stop`
Deactivates maintenance mode.

### 15. `POST /api/system/snapshot/create`
Captures a full system state snapshot.

### 16. `POST /api/system/snapshot/restore`
One-click restore of system state from snapshot.

### 17. `PATCH /api/system/configuration`
Updates configuration key and records version history.

### 18. `POST /api/system/emergency`
Triggers zero-latency emergency kill switch action.
