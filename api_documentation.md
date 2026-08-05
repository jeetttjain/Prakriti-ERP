# IAM Platform — API Reference

## Endpoints Specifications (`/api/identity/*`)

### 1. `POST /api/identity/login`
Centralized IAM authentication returning JWT tokens, session ID, and device trust metadata.

### 2. `POST /api/identity/logout`
Revokes active session and blacklists token.

### 3. `GET /api/identity/users`
Returns list of IAM user accounts.

### 4. `GET /api/identity/sessions`
Returns active session trajectory logs.

### 5. `GET /api/identity/devices`
Returns registered devices with risk scores and trust statuses.

### 6. `GET /api/identity/apikeys`
Returns registered active API keys.

### 7. `GET /api/identity/security`
Returns security policy configuration.

### 8. `POST /api/identity/session/revoke`
Force revokes an active session.

### 9. `POST /api/identity/device/trust`
Marks a device as trusted.

### 10. `POST /api/identity/device/block`
Blocks a device fingerprint.

### 11. `POST /api/identity/apikey`
Issues a new HMAC-signed API Key.

### 12. `PATCH /api/identity/security-policy`
Updates security policy settings.

### 13. `DELETE /api/identity/apikey/:id`
Revokes an API Key.
