# Diagnostics Engine & Health Inspector — Specification

## Diagnostic Test Suite (`diagnosticsEngine.js`)
On-demand diagnostic runner evaluates 5 core infrastructure layers:
1. **Database Connection**: MongoDB read/write responsiveness.
2. **Event Bus & Automation Queue**: Queue event dispatch operational check.
3. **Communication Platform Providers**: Provider health check (MetaCloudAPI, SendGrid).
4. **Enterprise Data Platform Storage**: Storage Manager read/write check.
5. **Identity & Access Platform**: JWT signing and session store health check.
