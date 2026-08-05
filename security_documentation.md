# Security, Compliance & File Sharing — Documentation

## Security Classifications
- `Public`: Freely accessible documents.
- `Internal`: Accessible to logged-in users.
- `Confidential`: Restricted to module owners.
- `Restricted`: Admin-only access.
- `Legal Hold`: Immutable, write-protected documents.

---

## Secure File Sharing (`SharedLink.js`)
Generates secure access links (`/api/data/share/:id`) with:
- Password protection
- Link expiration timestamp (`expiresAt`)
- Download count limits (`downloadLimit`)
- QR Code access URLs
