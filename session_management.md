# Session Management — Technical Specification

## Session Lifecycle States
Located under `server/src/core/identity/sessions/sessionManager.js` and `IdentitySession.js`.

```
[ Session Created ] ──► [ Active (JWT Token Valid) ] ──► [ Inactive / Expired ]
                                   │
                           (Admin / Force Logout)
                                   ▼
                             [ Revoked ] ──► (Token Added to TokenBlacklist.js)
```

---

## Capabilities
1. **Concurrent Session Limits**: Configurable max active sessions per user code.
2. **Force Logout / Session Revocation**: Invalidates session document and pushes access token hash into `TokenBlacklist.js`.
3. **Sliding Sessions**: Updates `lastActivityAt` timestamp on every valid API request.
