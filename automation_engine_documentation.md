# Enterprise Automation Engine — Documentation

## Executive Overview
Phase 7.3A implements the central Event-Driven Automation Engine infrastructure for Prakriti ERP. Located under `server/src/core/automation/`, it orchestrates event triggers, rule conditions, action execution contexts, priority queues, and system control flags.

---

## Core Capabilities
1. **Event-Driven Trigger Evaluation**: Evaluates rule conditions dynamically upon published Event Bus events.
2. **System Control Flags** (`systemControlFlags.js`): Exposes state flags (`isEngineEnabled`, `isSchedulerEnabled`, `isQueueEnabled`, `isMaintenanceMode`) for instant global management.
3. **Idempotency Deduplication**: Idempotency keys (`idempotencyKey`) prevent duplicate execution of actions across 5-minute sliding windows.
4. **Execution Context**: Isolates payload context and maintains a correlation ID (`correlationId`) across all sub-events and jobs.
