# Document Management & Metadata Registry — Specification

## Metadata Registry Schema (`EnterpriseFile.js`)

```typescript
interface EnterpriseFile {
  fileId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string; // SHA-256
  refCount: number;
  storageProvider: 'LocalStorage' | 'GridFS' | 'Cloudinary' | 'AWS_S3' | 'AzureBlob' | 'GCP';
  storagePath: string;
  storageTier: 'Hot' | 'Warm' | 'Cold' | 'Offline';
  module: string;
  entityType?: string;
  entityId?: string;
  owner: string;
  branch: string;
  securityClassification: 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'Legal Hold';
  tags: string[];
  metadata: Record<string, any>;
  version: number;
  isArchived: boolean;
  isDeleted: boolean;
}
```
