# Storage Architecture — Technical Specification

## Subsystem Topology
Located under `server/src/core/data/storage/storageManager.js` and `deduplication/deduplicationEngine.js`.

---

## Supported Storage Providers

| Storage Provider | Primary Use Case | Configuration Key |
| :--- | :--- | :--- |
| **LocalStorage** | On-premise local filesystem | `STORAGE_PROVIDER=LocalStorage` |
| **MongoDB GridFS** | Database-embedded document storage | `STORAGE_PROVIDER=GridFS` |
| **Cloudinary** | Optimized media asset storage | `STORAGE_PROVIDER=Cloudinary` |
| **AWS S3** | Cloud object storage | `STORAGE_PROVIDER=AWS_S3` |
| **Azure Blob** | Enterprise Azure cloud storage | `STORAGE_PROVIDER=AzureBlob` |
| **GCP Storage** | Google Cloud storage bucket | `STORAGE_PROVIDER=GCP` |

---

## SHA-256 Deduplication & Encryption
1. Buffer checksum generated via `crypto.createHash('sha256')`.
2. Existing record lookup in `EnterpriseFile.findOne({ checksum })`.
3. If duplicate found: Increment `refCount` and return existing document reference.
4. If unique: Write to active storage provider with AES-256 encryption at rest.
