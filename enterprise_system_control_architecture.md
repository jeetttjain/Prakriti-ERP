# Enterprise System Control Architecture — Full Technical Blueprint

## 1. Executive Summary
Phase 8 establishes the Enterprise System Control Engine (SCE) for Prakriti ERP under `server/src/core/system-control/`. SCE is the centralized runtime command center responsible for enabling, disabling, configuring, monitoring, and orchestrating every subsystem across the ERP.

---

## 2. Component Topology Diagram

```mermaid
flowchart TD
    A[Enterprise System Control Center UI] -->|1. Control Request| B[systemControlEngine.js]
    B -->|2. Validate Safe DAG Shutdown| C[dependencyOrchestrator.js & SystemModule Collection]
    B -->|3. Feature Flag Toggles & Canary Rollout| D[featureFlagEngine.js & FeatureFlag Collection]
    B -->|4. Dynamic Config Updates & Version History| E[configEngine.js & configVersionEngine.js]
    B -->|5. Capture & Restore Snapshots| F[snapshotEngine.js & SystemSnapshot Collection]
    B -->|6. Emergency Kill Switch| G[emergencyControl.js]
    G -->|7. Dispatch Emergency Alerts| H[Phase 7.3B Omnichannel Communication Platform]
    B -->|8. Emit Control Events| I[Phase 7.3A Event Bus: MODULE_STARTED / EMERGENCY_TRIGGERED]
```

---

## 3. System Integrations
- **Phase 7.3A Event Bus**: Emits `MODULE_STARTED`, `MODULE_STOPPED`, `FEATURE_ENABLED`, `FEATURE_DISABLED`, `CONFIG_UPDATED`, `MAINTENANCE_STARTED`, `MAINTENANCE_STOPPED`, and `EMERGENCY_TRIGGERED` events.
- **Phase 7.3B Communication Platform**: Dispatches emergency alert SMS/WhatsApp/Push notifications to system administrators.
- **Phase 7.6 Observability Platform**: Reads subsystem health status and telemetry.
