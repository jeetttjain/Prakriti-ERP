# Authentication Architecture — Technical Specification

## Subsystem Overview
Located under `server/src/core/identity/authentication/authenticationEngine.js` and `identityProviderRegistry.js`.

---

## Identity Provider Architecture

```
[ Incoming Credentials ]
           │
           ▼
[ identityProviderRegistry.js ]
 ├── Local Authentication (Default)
 ├── LDAP / Active Directory Interface
 ├── OAuth2 / OpenID Connect Interface
 └── SAML Enterprise SSO Interface
           │
           ▼
[ authenticationEngine.js ]
 ├── Password Hash Verification (Bcrypt)
 ├── Dynamic Risk Score Calculation (identityRiskEngine.js)
 ├── Device Registration / Trust Lookup (deviceManager.js)
 └── Token & Session Issuance (tokenEngine.js & sessionManager.js)
```
