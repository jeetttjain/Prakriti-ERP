# Enterprise Identity & Access Platform (IAM) — Overview Documentation

## System Purpose
Phase 7.5 delivers the centralized Enterprise Identity & Access Platform (IAM) for Prakriti ERP under `server/src/core/identity/`. IAM becomes the single source of truth for authentication, authorization (RBAC/ABAC), token rotation, session management, device trust, API key management, security policy enforcement, and identity audit logging.

---

## Core Capabilities
1. **Plugin-Based Identity Provider Registry**: Supports Local, LDAP, Active Directory, OAuth2, OIDC, SAML, Google, Microsoft, and GitHub providers.
2. **Centralized Authentication & Token Rotation**: Access and Refresh token generation (`tokenEngine.js`) with JWT token rotation, sliding sessions, and token blacklisting (`TokenBlacklist.js`).
3. **Fine-Grained Authorization (RBAC + ABAC)**: Centralizes role hierarchies and attribute-based access control (`abacPolicyEngine.js`) checking branch, time, device risk score, and ownership.
4. **Active Session & Device Manager**: Manages active concurrent sessions (`IdentitySession.js`), force logouts, device fingerprinting (`IdentityDevice.js`), trusted devices, and device revocation.
5. **Dynamic Identity Risk Engine**: Calculates dynamic login risk scores (0-100) based on new devices, impossible travel, and failed attempt velocity.
6. **API Key Studio & Secret Management**: Issues HMAC-signed API keys (`ApiKey.js`) with scope restrictions, rate limits, and secret manager abstraction.
7. **Event Bus & Communication Integration**: Emits identity events (`USER_LOGIN`, `USER_LOGOUT`, `SESSION_REVOKED`, `DEVICE_TRUSTED`) to the Phase 7.3A Event Bus, triggering Phase 7.3B Communication notifications.
