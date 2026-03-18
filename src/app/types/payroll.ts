export type EmploymentStatus = 'regular' | 'contractual' | 'probationary';
export type PayrollPeriod = 'weekly' | 'semi-monthly' | 'monthly';
export type LeaveType = 'sick' | 'vacation' | 'emergency';
export type UserRole = 'admin' | 'hr-manager' | 'payroll-officer' | 'employee';

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  position: string;
  department: string;
  status: EmploymentStatus;
  basic_pay: number;
  hourly_rate: number;
  tax_id?: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  bank_account?: string;
  email: string;
  hire_date: string;
  avatar_url?: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  hours_worked: number;
  overtime: number;
  status: 'present' | 'absent' | 'late' | 'on-leave';
  leave_type?: LeaveType;
}

export interface Deduction {
  id: string;
  name: string;
  amount: number;
  type: 'tax' | 'sss' | 'philhealth' | 'pagibig' | 'loan' | 'other';
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name?: string; // Virtual or joined
  period_label: string;
  period_type: PayrollPeriod;
  basic_pay: number;
  overtime_pay: number;
  holiday_pay: number;
  bonuses: number;
  gross_pay: number;
  deductions: Deduction[];
  total_deductions: number;
  net_pay: number;
  status: 'pending' | 'processed' | 'paid';
  generated_date: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string; // Virtual or joined
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}
