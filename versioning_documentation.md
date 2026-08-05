# Document Version Control & History — Specification

## Revision Flow
Located under `server/src/core/data/versioning/fileVersioning.js`.
1. `fileVersioning.createNewVersion(fileId, buffer)` archives current file state into `FileVersion` collection.
2. Updates `EnterpriseFile` version counter (`version += 1`).
3. `fileVersioning.rollbackVersion(fileId, targetVersionNumber)` restores target revision metadata while preserving history.
