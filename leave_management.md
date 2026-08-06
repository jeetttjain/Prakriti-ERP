# Leave Engine & Approval Workflow — Specification

## Leave Request Flow (`LeaveRequest.js` & `leaveEngine.js`)

```
[ Apply Leave ] ──► [ Verify Leave Balance ] ──► [ Manager Approval ]
                                                          │
                                                          ▼
                                          [ Deduct Balance & Emit LEAVE_APPROVED ]
```
