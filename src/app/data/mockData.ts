import { Employee, Attendance, PayrollRecord, LeaveRequest, Deduction } from '../types/payroll';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'Maria Santos',
    position: 'Software Engineer',
    department: 'Engineering',
    status: 'regular',
    basicPay: 50000,
    hourlyRate: 312.5,
    taxId: 'TIN-123-456-789',
    sssNumber: 'SSS-34-1234567-8',
    philHealthNumber: 'PH-12-345678901-2',
    pagIbigNumber: 'HDMF-1234-5678-9012',
    bankAccount: 'BDO-1234567890',
    email: 'maria.santos@company.com',
    hireDate: '2022-01-15',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Juan Dela Cruz',
    position: 'Marketing Manager',
    department: 'Marketing',
    status: 'regular',
    basicPay: 60000,
    hourlyRate: 375,
    taxId: 'TIN-234-567-890',
    sssNumber: 'SSS-34-2345678-9',
    philHealthNumber: 'PH-12-456789012-3',
    pagIbigNumber: 'HDMF-2345-6789-0123',
    bankAccount: 'BPI-2345678901',
    email: 'juan.delacruz@company.com',
    hireDate: '2021-06-01',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Anna Reyes',
    position: 'HR Specialist',
    department: 'Human Resources',
    status: 'regular',
    basicPay: 45000,
    hourlyRate: 281.25,
    taxId: 'TIN-345-678-901',
    sssNumber: 'SSS-34-3456789-0',
    philHealthNumber: 'PH-12-567890123-4',
    pagIbigNumber: 'HDMF-3456-7890-1234',
    bankAccount: 'BDO-3456789012',
    email: 'anna.reyes@company.com',
    hireDate: '2023-03-20',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Carlos Mendoza',
    position: 'Accountant',
    department: 'Finance',
    status: 'contractual',
    basicPay: 40000,
    hourlyRate: 250,
    taxId: 'TIN-456-789-012',
    sssNumber: 'SSS-34-4567890-1',
    philHealthNumber: 'PH-12-678901234-5',
    pagIbigNumber: 'HDMF-4567-8901-2345',
    bankAccount: 'BPI-4567890123',
    email: 'carlos.mendoza@company.com',
    hireDate: '2024-01-10',
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'Sofia Garcia',
    position: 'Junior Developer',
    department: 'Engineering',
    status: 'probationary',
    basicPay: 35000,
    hourlyRate: 218.75,
    taxId: 'TIN-567-890-123',
    sssNumber: 'SSS-34-5678901-2',
    philHealthNumber: 'PH-12-789012345-6',
    pagIbigNumber: 'HDMF-5678-9012-3456',
    bankAccount: 'BDO-5678901234',
    email: 'sofia.garcia@company.com',
    hireDate: '2025-11-01',
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Roberto Aquino',
    position: 'Sales Executive',
    department: 'Sales',
    status: 'regular',
    basicPay: 42000,
    hourlyRate: 262.5,
    taxId: 'TIN-678-901-234',
    sssNumber: 'SSS-34-6789012-3',
    philHealthNumber: 'PH-12-890123456-7',
    pagIbigNumber: 'HDMF-6789-0123-4567',
    bankAccount: 'BPI-6789012345',
    email: 'roberto.aquino@company.com',
    hireDate: '2022-08-15',
  },
];

export const mockAttendance: Attendance[] = [
  {
    id: 'att1',
    employeeId: '1',
    date: '2026-03-10',
    timeIn: '08:00',
    timeOut: '17:30',
    hoursWorked: 9.5,
    overtime: 1.5,
    status: 'present',
  },
  {
    id: 'att2',
    employeeId: '1',
    date: '2026-03-11',
    timeIn: '08:15',
    timeOut: '17:00',
    hoursWorked: 8.75,
    overtime: 0,
    status: 'late',
  },
  {
    id: 'att3',
    employeeId: '2',
    date: '2026-03-10',
    timeIn: '08:00',
    timeOut: '17:00',
    hoursWorked: 9,
    overtime: 1,
    status: 'present',
  },
  {
    id: 'att4',
    employeeId: '3',
    date: '2026-03-10',
    timeIn: '08:00',
    timeOut: '17:00',
    hoursWorked: 9,
    overtime: 1,
    status: 'present',
  },
  {
    id: 'att5',
    employeeId: '4',
    date: '2026-03-10',
    timeIn: '00:00',
    timeOut: '00:00',
    hoursWorked: 0,
    overtime: 0,
    status: 'absent',
  },
];

const calculateDeductions = (grossPay: number): Deduction[] => {
  const sss = Math.min(grossPay * 0.045, 1800); // 4.5% capped
  const philHealth = grossPay * 0.02; // 2%
  const pagIbig = Math.min(grossPay * 0.02, 100); // 2% capped at 100
  const tax = grossPay > 50000 ? grossPay * 0.15 : grossPay * 0.10; // Simplified tax
  
  return [
    { id: 'd1', name: 'Withholding Tax', amount: tax, type: 'tax' },
    { id: 'd2', name: 'SSS Contribution', amount: sss, type: 'sss' },
    { id: 'd3', name: 'PhilHealth', amount: philHealth, type: 'philhealth' },
    { id: 'd4', name: 'Pag-IBIG', amount: pagIbig, type: 'pagibig' },
  ];
};

export const mockPayrollRecords: PayrollRecord[] = mockEmployees.map((emp, index) => {
  const basicPay = emp.basicPay;
  const overtimePay = emp.hourlyRate * (Math.random() * 10); // Random overtime
  const holidayPay = index % 2 === 0 ? emp.hourlyRate * 8 : 0;
  const bonuses = index === 0 ? 5000 : 0;
  const grossPay = basicPay + overtimePay + holidayPay + bonuses;
  const deductions = calculateDeductions(grossPay);
  // Update deduction IDs to be unique per payroll record
  const uniqueDeductions = deductions.map((d, i) => ({
    ...d,
    id: `pay${index + 1}-d${i + 1}`,
  }));
  const totalDeductions = uniqueDeductions.reduce((sum, d) => sum + d.amount, 0);
  const netPay = grossPay - totalDeductions;

  return {
    id: `pay${index + 1}`,
    employeeId: emp.id,
    employeeName: emp.name,
    period: 'February 16-28, 2026',
    periodType: 'semi-monthly',
    basicPay,
    overtimePay,
    holidayPay,
    bonuses,
    grossPay,
    deductions: uniqueDeductions,
    totalDeductions,
    netPay,
    status: index < 2 ? 'paid' : index < 4 ? 'processed' : 'pending',
    generatedDate: '2026-03-01',
  };
});

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave1',
    employeeId: '1',
    employeeName: 'Maria Santos',
    leaveType: 'vacation',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    days: 3,
    reason: 'Family vacation',
    status: 'approved',
  },
  {
    id: 'leave2',
    employeeId: '3',
    employeeName: 'Anna Reyes',
    leaveType: 'sick',
    startDate: '2026-03-18',
    endDate: '2026-03-18',
    days: 1,
    reason: 'Medical checkup',
    status: 'pending',
  },
  {
    id: 'leave3',
    employeeId: '5',
    employeeName: 'Sofia Garcia',
    leaveType: 'emergency',
    startDate: '2026-03-25',
    endDate: '2026-03-26',
    days: 2,
    reason: 'Family emergency',
    status: 'pending',
  },
];