# Enterprise HRMS Platform — API Reference

## Endpoints Specifications (`/api/hrms/*`)

### 1. `GET /api/hrms/employees`
Returns employee directory and profile statuses.

### 2. `GET /api/hrms/organization/chart`
Returns multi-company organization structure and department hierarchy.

### 3. `GET /api/hrms/attendance`
Returns attendance logs.

### 4. `GET /api/hrms/leave`
Returns leave applications.

### 5. `GET /api/hrms/payroll`
Returns monthly statutory payroll runs.

### 6. `GET /api/hrms/analytics`
Generates HR metrics (Headcount, Attrition %, Attendance %, Payroll Cost).

### 7. `POST /api/hrms/employee`
Onboards a new employee and triggers automated IAM account and email workflow.

### 8. `POST /api/hrms/attendance`
Marks daily attendance (Manual, GPS, Biometric).

### 9. `POST /api/hrms/leave`
Submits leave request.

### 10. `POST /api/hrms/payroll/run`
Executes monthly statutory payroll run and posts finance journal entries to EFAP.

### 11. `POST /api/hrms/expense`
Submits an employee expense claim reimbursement.

### 12. `POST /api/hrms/helpdesk/ticket`
Raises an HR/IT helpdesk ticket.

### 13. `POST /api/hrms/visitor/pass`
Generates a visitor/contractor gate pass.
