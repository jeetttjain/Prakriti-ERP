# Subsystem Runtime Engine & DAG Orchestration — Specification

## Topology (`systemControlEngine.js` & `dependencyOrchestrator.js`)

```
[ Stop Command Issued ] ──► [ DAG Dependency Check ]
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
        [ Dependents Running? ]             [ No Dependents Running ]
                 │                                   │
      ┌──────────┴──────────┐                        │
      ▼                     ▼                        ▼
 [ Force = false ]    [ Force = true ]    [ Module Status = Stopped ]
(Reject Shutdown)   (Shutdown Approved)   (Emit MODULE_STOPPED Event)
```
