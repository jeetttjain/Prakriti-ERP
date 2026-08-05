# Security Policies & API Key Management — Documentation

## Security Policy Controls (`SecurityPolicy.js`)
- **Password Complexity**: Minimum 8 characters with special characters required.
- **Account Lockout**: 5 failed login attempts lock account for 15 minutes.
- **Session Timeout**: Inactive sessions expire automatically after 60 minutes.
- **IP Restrictions**: Enforces IP allowlists and blocklists.

---

## API Key Studio (`ApiKey.js` & `apiKeyManager.js`)
- Issues HMAC-signed API Keys (`pk_live_...`) with custom scopes (`READ_ONLY`, `ORDERS_WRITE`).
- Enforces rate limiting per key (default 1,000 requests / hour).
- Revocation endpoint immediately deactivates compromised keys.
