# Enterprise Observability Platform (EOP) — Overview Documentation

## System Purpose
Phase 7.6 delivers the Enterprise Observability Platform (EOP) for Prakriti ERP under `server/src/core/observability/`. EOP is the single source of truth for logging, metrics, tracing, alerting, diagnostics, performance profiling, and operational intelligence.

---

## Core Capabilities
1. **Unified Telemetry Pipeline**: Centralized pipeline (`telemetryPipeline.js`) capturing logs, metrics, traces, and health checks from all ERP modules.
2. **Structured JSON Logging & Sensitivity Masking**: `loggerEngine.js` writes structured JSON logs (`SystemLog.js`) and redacts passwords, keys, and tokens automatically via `logMasker.js`.
3. **Correlation & Distributed Tracing**: `correlationEngine.js` & `tracingEngine.js` generate Trace IDs, Span IDs, and Correlation IDs for request lifecycle duration tracking (`TraceSpan.js`).
4. **Metrics Collection & System Health Inspector**: `metricsEngine.js` and `healthEngine.js` collect CPU, Memory, Disk, MongoDB latency, and subsystem health statuses (`Healthy`, `Warning`, `Critical`, `Maintenance`).
5. **Configurable Alert Engine & Communication Dispatch**: `alertEngine.js` triggers alerts based on threshold rules (`AlertRule.js`) and dispatches critical alerts through the Phase 7.3B Communication Engine.
6. **SLI / SLO Framework**: `sloEngine.js` tracks SLA availability (99.95%), error rate, and response times.
7. **Diagnostics Test Studio & Performance Profiler**: `diagnosticsEngine.js` executes on-demand diagnostic checks across DB, Queue, Storage, Communication, and APIs.
