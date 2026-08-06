# Finance-Integrated Statutory Payroll Engine — Specification

## Payroll Run Execution (`PayrollRun.js`, `SalaryStructure.js` & `payrollEngine.js`)

```
[ Monthly Payroll Calculation ]
            │
            ├─► Calculate Basic + HRA + Allowances
            ├─► Deduct PF (12%) + ESI + TDS + PT
            ▼
[ Generate Payslips & Emit PAYROLL_COMPLETED ]
            │
            ▼
[ Post Double-Entry Journal to Phase 7.7 Finance (EFAP) ]
  • Debit  5000: Salary Expense (Gross)
  • Credit 2000: Salaries Payable (Net)
  • Credit 2100: Statutory Tax Liabilities (Deductions)
```
