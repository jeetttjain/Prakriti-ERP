# Enterprise Human Resource Management Platform (EHRMP) — Overview Documentation

## System Purpose
Phase 9 delivers the Enterprise Human Resource Management Platform (EHRMP) for Prakriti ERP under `server/src/core/hrms/`. EHRMP is the single source of truth for the complete employee lifecycle, organization structure, attendance monitoring, leave management, shift roster planning, finance-integrated payroll processing, performance reviews, recruitment, training, employee documents, hardware assets, biometric integration, and employee self-service (ESS).

---

## Core Capabilities
1. **Employee Lifecycle & Automated Onboarding**: `employeeManager.js` and `employeeOnboardingAutomation.js` manage employee onboarding, status transitions, auto-creation of IAM identity accounts (Phase 7.5), role assignments, and welcome email dispatch (Phase 7.3B).
2. **Multi-Company & Org Hierarchy Engine**: `orgStructureEngine.js` builds interactive Org Chart APIs across Company $\rightarrow$ Business Unit $\rightarrow$ Region $\rightarrow$ Branch $\rightarrow$ Department $\rightarrow$ Team $\rightarrow$ Employee.
3. **Multi-Mode Attendance & Shift Engine**: `attendanceEngine.js` and `shiftRosterEngine.js` support Manual, GPS, WiFi, and Biometric attendance with shift grace time, late marks, and regularization.
4. **Leave Engine & Multi-Level Approvals**: `leaveEngine.js` handles Casual, Sick, Earned, Maternity, Paternity, and Comp Off leave balances, carry forward, and approval workflows.
5. **Finance-Integrated Statutory Payroll Engine**: `payrollEngine.js` calculates monthly payroll with statutory deductions (PF, ESI, TDS, Professional Tax), generates payslips, and posts double-entry salary expense journal entries directly to Phase 7.7 EFAP (`journalEngine.js`).
6. **Performance, Recruitment, Training, Documents & Assets**:
   - `performanceEngine.js`: KRAs, KPIs, 360 Feedback, and Performance Reviews.
   - `recruitmentEngine.js`: Job openings, candidate pipeline, and offer letters.
   - `trainingPlatform.js`: Training courses, certificates, and skill matrix.
   - `employeeDocumentEngine.js` & `employeeAssetManager.js`: Document vault (Aadhaar, PAN, Resume, NDA) and hardware asset tracker (Laptops, Mobiles, SIMs, Vehicles).
7. **Expense Claims & HR Helpdesk**: `employeeExpenseManager.js` handles reimbursements, and `hrHelpdeskEngine.js` manages HR/IT tickets.
8. **Event Bus Integration**: Emits `EMPLOYEE_CREATED`, `EMPLOYEE_UPDATED`, `ATTENDANCE_MARKED`, `LEAVE_APPROVED`, `PAYROLL_COMPLETED`, `PERFORMANCE_COMPLETED`, and `EMPLOYEE_EXITED` into the Phase 7.3A Event Bus.
