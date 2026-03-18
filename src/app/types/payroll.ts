export type EmploymentStatus = 'regular' | 'contractual' | 'probationary';
export type PayrollPeriod = 'weekly' | 'semi-monthly' | 'monthly';
export type LeaveType = 'sick' | 'vacation' | 'emergency';
export type UserRole = 'admin' | 'hr-manager' | 'payroll-officer' | 'employee';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  status: EmploymentStatus;
  basicPay: number;
  hourlyRate: number;
  taxId: string;
  sssNumber: string;
  philHealthNumber: string;
  pagIbigNumber: string;
  bankAccount: string;
  email: string;
  hireDate: string;
  avatar?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  timeIn: string;
  timeOut: string;
  hoursWorked: number;
  overtime: number;
  status: 'present' | 'absent' | 'late' | 'on-leave';
  leaveType?: LeaveType;
}

export interface Deduction {
  id: string;
  name: string;
  amount: number;
  type: 'tax' | 'sss' | 'philhealth' | 'pagibig' | 'loan' | 'other';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  periodType: PayrollPeriod;
  basicPay: number;
  overtimePay: number;
  holidayPay: number;
  bonuses: number;
  grossPay: number;
  deductions: Deduction[];
  totalDeductions: number;
  netPay: number;
  status: 'pending' | 'processed' | 'paid';
  generatedDate: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}
