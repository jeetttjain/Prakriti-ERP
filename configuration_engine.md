# Dynamic Configuration & Version Rollback — Specification

## Configuration Versioning (`SystemConfig.js` & `ConfigVersion.js`)
- Every configuration edit increments the configuration `version` and records a version snapshot in `ConfigVersion.js`.
- **One-Click Rollback**: Reverts a configuration key to any historical version ID without data loss.
