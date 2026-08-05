# Enterprise Identity Platform Architecture — Full Technical Blueprint

## 1. Executive Summary
Phase 7.5 establishes the Enterprise Identity & Access Platform (IAM) for Prakriti ERP. IAM becomes the single source of truth for authentication, authorization (RBAC/ABAC), active session management, device trust, API key management, security policy enforcement, and identity audit logging.

---

## 2. Component Topology Diagram

```mermaid
flowchart TD
    A[Client Request / Login / API Access] -->|1. Authenticate Request| B[authenticationEngine.js & identityProviderRegistry.js]
    B -->|2. Compute Dynamic Login Risk| C[identityRiskEngine.js]
    B -->|3. Register Device Fingerprint| D[deviceManager.js & IdentityDevice Collection]
    B -->|4. Issue Tokens & Create Session| E[tokenEngine.js & sessionManager.js]
    A -->|5. Protected API Call| F[authorizationEngine.js & abacPolicyEngine.js]
    F -->|6. Check Permissions| G[permissionRegistry.js]
    E -->|7. Force Revoke Session| H[TokenBlacklist.js]
    B -->|8. Emit Security Events| I[Event Bus: USER_LOGIN / SESSION_REVOKED]
    I -->|9. Trigger Alert Notifications| J[Phase 7.3B Communication Engine]
```

---

## 3. Token Rotation & Sliding Session Architecture
- Access tokens expire after 1 hour (`expiresIn: "1h"`).
- Refresh tokens expire after 7 days (`expiresIn: "7d"`).
- Token revocation writes SHA-256 token hash to `TokenBlacklist.js`, instantly blocking stolen tokens across all cluster nodes.

---

## 4. Future SSO & External Provider Architecture
Interfaces prepared for seamless future integration with:
- OAuth2 (Google, Microsoft, GitHub)
- OpenID Connect (OIDC)
- SAML 2.0 Enterprise SSO
- LDAP / Active Directory Domain Controllers
- Passkeys & Biometric Authentication
