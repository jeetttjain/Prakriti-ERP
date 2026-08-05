# Authorization Architecture (RBAC & ABAC) — Specification

## Authorization Engine Flow
Located under `server/src/core/identity/authorization/authorizationEngine.js`, `permissionRegistry.js`, and `abacPolicyEngine.js`.

---

## Authorization Evaluation Order
1. **System Admin / Owner Bypass**: Roles with `Admin` or `SuperAdmin` privileges pass instantly.
2. **Permission Registry Lookup**: Maps requested resource and action against `permissionRegistry.js`.
3. **ABAC Policy Evaluation**: Evaluates dynamic attributes:
   - Branch & Department restrictions
   - Device Risk Score (denied if score > 85)
   - Working hours policy
4. **Final Decision**: Returns `{ isAllowed: boolean, reason: string }`.
