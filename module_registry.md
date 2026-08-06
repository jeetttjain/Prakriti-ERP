# Module Registry Specification

## Registered Core ERP Subsystems (`SystemModule.js`)
1. **`MOD-AUTOMATION`**: Automation Core & Event Bus Engine.
2. **`MOD-COMMUNICATION`**: Omnichannel Communication Platform (depends on `MOD-AUTOMATION`).
3. **`MOD-EDP`**: Enterprise Data Platform (EDP) (depends on `MOD-AUTOMATION`).
4. **`MOD-IAM`**: Identity & Access Platform (IAM) (depends on `MOD-AUTOMATION`).
5. **`MOD-BI`**: Business Intelligence & Analytics Engine (depends on `MOD-AUTOMATION`, `MOD-EDP`).
6. **`MOD-OBSERVABILITY`**: Enterprise Observability Platform (EOP) (depends on `MOD-AUTOMATION`).
7. **`MOD-FINANCE`**: Enterprise Finance & Accounting Platform (EFAP) (depends on `MOD-AUTOMATION`, `MOD-IAM`).
8. **`MOD-SUPPLYCHAIN`**: Multi-Branch & Supply Chain Platform (EMSCP) (depends on `MOD-AUTOMATION`, `MOD-FINANCE`).
