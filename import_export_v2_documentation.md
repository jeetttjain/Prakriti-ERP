# Import Engine & Export Engine V2 — Documentation

## Import Engine Validation Framework
Located under `server/src/core/data/imports/importEngine.js`.
- Supports CSV, Excel, JSON, XML formats.
- Pre-import Dry Run validation mode (`status = "PREVIEW"`).
- Rollback snapshot generation for failed import recovery.
- Error log compilation (`errorLog: [{ row, error }]`).
