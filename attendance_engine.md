# Multi-Mode Attendance & Shift Roster Engine — Specification

## Attendance Schema (`Attendance.js`)

```typescript
interface Attendance {
  attendanceId: string;
  companyCode: string;
  employeeCode: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'Present' | 'Absent' | 'HalfDay' | 'Late';
  method: 'Manual' | 'GPS' | 'Biometric' | 'WiFi';
}
```
