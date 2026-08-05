# Enterprise Data Platform — Overview Documentation

## System Purpose
Phase 7.4 establishes the Enterprise Data Platform (EDP) for Prakriti ERP under `server/src/core/data/`. All files, media assets, documents, imports, exports, and backups flow through this unified data infrastructure layer.

---

## Core Capabilities
1. **Provider-Agnostic Storage**: Switch storage providers (Local Storage, GridFS, Cloudinary, AWS S3, Azure Blob, GCP) via configuration without code changes.
2. **SHA-256 Checksum Deduplication**: Automatically detects duplicate file contents using SHA-256 hashes and increments reference counters (`refCount`).
3. **Storage Tiering**: Automatically tiers files across `Hot Storage`, `Warm Storage`, `Cold Archive`, and `Offline Archive`.
4. **Document Version Control**: Supports document revision control history (`FileVersion.js`), diff comparisons, and version rollbacks.
5. **Backup & Point-in-Time Restore**: System backup manifests (`DataBackup.js`) with point-in-time disaster recovery simulation.
6. **Global Search Engine**: Full-text and metadata search engine across filenames, document numbers, tags, customer/supplier names, and classifications.
7. **Event Bus Integration**: Emits file lifecycle events (`FILE_UPLOADED`, `FILE_UPDATED`, `BACKUP_COMPLETED`, `RESTORE_COMPLETED`) to the Phase 7.3A Event Bus.
