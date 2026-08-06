# Enterprise System Control Engine (SCE) — Overview Documentation

## System Purpose
Phase 8 delivers the Enterprise System Control Engine (SCE) for Prakriti ERP under `server/src/core/system-control/`. SCE is the centralized runtime command center responsible for enabling, disabling, configuring, monitoring, and orchestrating every subsystem across the ERP ecosystem.

---

## Core Capabilities
1. **Module Registry & DAG Dependency Orchestration**: `moduleRegistry.js` and `dependencyOrchestrator.js` manage module registration (`SystemModule.js`) and prevent unsafe module shutdowns unless `force=true`.
2. **Subsystem Runtime Engine**: `systemControlEngine.js` controls module and service group states (`Running`, `Stopped`, `Maintenance`, `Paused`, `Drain`).
3. **Feature Flag & Canary Rollout Engine**: `featureFlagEngine.js` manages runtime feature flags (`FeatureFlag.js`) (WhatsApp, SMS, Scheduler, Cold Storage, GST, Barcode, AI) with canary percentage rollouts.
4. **Dynamic Configuration Engine & Rollback**: `configEngine.js` and `configVersionEngine.js` manage hot-reloading configurations (`SystemConfig.js`) with immutable version history (`ConfigVersion.js`) and one-click rollback.
5. **System State Snapshots**: `snapshotEngine.js` captures full system state snapshots (`SystemSnapshot.js`) for one-click system state restore.
6. **Emergency Kill Switches & Recovery Playbooks**: `emergencyControl.js` provides zero-latency kill switches for automation, queues, communication, user logins, finance, and APIs, dispatching emergency alerts via Phase 7.3B Communication Engine.
7. **Maintenance Window Manager**: `maintenanceEngine.js` activates global, module, and branch maintenance windows (`SystemMaintenance.js`).
8. **Event Bus Integration**: Emits `MODULE_STARTED`, `MODULE_STOPPED`, `FEATURE_ENABLED`, `FEATURE_DISABLED`, `CONFIG_UPDATED`, `MAINTENANCE_STARTED`, `MAINTENANCE_STOPPED`, and `EMERGENCY_TRIGGERED` events into the Phase 7.3A Event Bus.
