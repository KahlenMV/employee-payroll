import type { Employee, Attendance, PayrollRecord, LeaveRequest } from '../types/payroll';

// ─── Generic CSV Helper ───────────────────────────────────────────────────────

function downloadCSV(filename: string, rows: string[][]): void {
  const header = rows[0];
  const body = rows.slice(1);

  const escape = (val: string | number) => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csv = [header, ...body]
    .map(row => row.map(escape).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Feature 1 – New Employee ID generation ───────────────────────────────────

/** Returns the next EMP-prefixed ID given the existing list. */
export function generateEmployeeId(employees: Employee[]): string {
  const maxNum = employees.reduce((max, e) => {
    const n = parseInt(e.employeeId.replace(/\D/g, ''), 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return `EMP${String(maxNum + 1).padStart(3, '0')}`;
}

/** Derive hourly rate from monthly basic pay (22 working days × 8 hrs). */
export function calcHourlyRate(basicPay: number): number {
  return parseFloat((basicPay / 176).toFixed(4)); // 22d × 8h = 176h
}

// ─── Feature 2 – Export Attendance & Leave (filtered by year) ─────────────────

export function exportAttendanceAndLeave(
  attendance: Attendance[],
  employees: Employee[],
  leaveRequests: LeaveRequest[],
  year: number
): void {
  const yearStr = String(year);

  // Attendance rows
  const attFiltered = attendance.filter(a => a.date.startsWith(yearStr));
  const attRows: string[][] = [
    ['Type', 'Employee ID', 'Employee Name', 'Date', 'Time In', 'Time Out', 'Hours Worked', 'Overtime', 'Status'],
    ...attFiltered.map(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      return [
        'Attendance',
        emp?.employeeId ?? '',
        emp?.name ?? '',
        a.date,
        a.timeIn || '-',
        a.timeOut || '-',
        a.hoursWorked.toFixed(2),
        a.overtime.toFixed(2),
        a.status,
      ];
    }),
  ];

  // Leave rows
  const leaveFiltered = leaveRequests.filter(l => l.startDate.startsWith(yearStr));
  const leaveRows: string[][] = leaveFiltered.map(l => {
    const emp = employees.find(e => e.id === l.employeeId);
    return [
      'Leave',
      emp?.employeeId ?? '',
      l.employeeName,
      l.startDate,
      '-',
      '-',
      String(l.days),
      '0',
      l.status,
    ];
  });

  const rows = [...attRows, ...leaveRows.slice(0)]; // header already in attRows
  downloadCSV(`Attendance_Leave_${year}.csv`, rows);
}

// ─── Feature 3 – Approve / Reject Leave (returned as new array) ───────────────

export function applyLeaveDecision(
  requests: LeaveRequest[],
  id: string,
  decision: 'approved' | 'rejected'
): LeaveRequest[] {
  return requests.map(r => (r.id === id ? { ...r, status: decision } : r));
}

// ─── Feature 4 – Process Payroll ─────────────────────────────────────────────

export interface ProcessPayrollOptions {
  employees: Employee[];
  attendance: Attendance[];
  period: string;
  periodType: 'semi-monthly' | 'monthly' | 'weekly';
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
}

function calcDeductions(grossPay: number) {
  const sss = Math.min(grossPay * 0.045, 1125);
  const philHealth = grossPay * 0.02;
  const pagIbig = Math.min(grossPay * 0.02, 100);
  const tax = grossPay > 50000 ? grossPay * 0.15 : grossPay * 0.10;
  return {
    sss: parseFloat(sss.toFixed(2)),
    philHealth: parseFloat(philHealth.toFixed(2)),
    pagIbig: parseFloat(pagIbig.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
  };
}

export function processPayroll(opts: ProcessPayrollOptions, existingRecords: PayrollRecord[] = []): PayrollRecord[] {
  const { employees, attendance, period, periodType, periodStart, periodEnd } = opts;

  // Check for existing records in same period to prevent duplication
  const isDuplicate = existingRecords.some(r => r.period === period);
  if (isDuplicate) {
    throw new Error(`Payroll for ${period} has already been processed.`);
  }

  const periodAtt = attendance.filter(a => a.date >= periodStart && a.date <= periodEnd);
  const generatedDate = new Date().toISOString().split('T')[0];

  return employees.map((emp, idx) => {
    const empAtt = periodAtt.filter(a => a.employeeId === emp.id);
    const totalOT = empAtt.reduce((s, a) => s + a.overtime, 0);
    const overtimePay = parseFloat((totalOT * emp.hourlyRate * 1.25).toFixed(2));
    const holidayPay = 0; // holidays would come from a holiday config
    const bonuses = 0;
    const grossPay = parseFloat((emp.basicPay + overtimePay + holidayPay + bonuses).toFixed(2));
    const { sss, philHealth, pagIbig, tax } = calcDeductions(grossPay);
    const totalDeductions = parseFloat((sss + philHealth + pagIbig + tax).toFixed(2));
    const netPay = parseFloat((grossPay - totalDeductions).toFixed(2));

    return {
      id: `pay-${emp.id}-${periodStart}`,
      employeeId: emp.id,
      employeeName: emp.name,
      period,
      periodType,
      basicPay: emp.basicPay,
      overtimePay,
      holidayPay,
      bonuses,
      grossPay,
      deductions: [
        { id: `d-tax-${idx}`, name: 'Withholding Tax', amount: tax, type: 'tax' },
        { id: `d-sss-${idx}`, name: 'SSS Contribution', amount: sss, type: 'sss' },
        { id: `d-ph-${idx}`, name: 'PhilHealth', amount: philHealth, type: 'philhealth' },
        { id: `d-pi-${idx}`, name: 'Pag-IBIG', amount: pagIbig, type: 'pagibig' },
      ],
      totalDeductions,
      netPay,
      status: 'processed',
      generatedDate,
    } as PayrollRecord;
  });
}

// ─── Feature 5 – Download Payslip as PDF (via browser print) ─────────────────

export function printPayslip(elementId: string): void {
  const el = document.getElementById(elementId);
  if (!el) return;
  const printContents = el.innerHTML;
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) return;
  w.document.write(`
    <html>
      <head>
        <title>Payslip</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; font-size: 13px; }
          h3, h4, h5 { margin: 0 0 4px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { padding: 6px 8px; border: 1px solid #e5e7eb; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .net { font-size: 18px; font-weight: 700; color: #16a34a; }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

// ─── Feature 6 – Export Reports (all employees summary) ──────────────────────

export function exportReports(
  payrollRecords: PayrollRecord[],
  employees: Employee[],
  period: string
): void {
  const rows: string[][] = [
    ['Employee ID', 'Name', 'Department', 'Period', 'Basic Pay', 'Overtime', 'Holiday Pay', 'Bonuses', 'Gross Pay', 'Total Deductions', 'Net Pay', 'Status'],
    ...payrollRecords.map(r => {
      const emp = employees.find(e => e.id === r.employeeId);
      return [
        emp?.employeeId ?? '',
        r.employeeName,
        emp?.department ?? '',
        r.period,
        r.basicPay.toFixed(2),
        r.overtimePay.toFixed(2),
        r.holidayPay.toFixed(2),
        r.bonuses.toFixed(2),
        r.grossPay.toFixed(2),
        r.totalDeductions.toFixed(2),
        r.netPay.toFixed(2),
        r.status,
      ];
    }),
  ];
  const safe = period.replace(/[^a-zA-Z0-9-]/g, '_');
  downloadCSV(`Payroll_Report_${safe}.csv`, rows);
}

// ─── Feature 7 – Export Payroll-by-Department Chart ──────────────────────────

/** Exports the chart as PNG by capturing the recharts SVG inside a container. */
export function exportChartAsImage(containerId: string, filename = 'chart.png'): void {
  const container = document.getElementById(containerId);
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    canvas.width = svg.clientWidth || 600;
    canvas.height = svg.clientHeight || 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = filename;
    a.click();
  };
  img.src = url;
}

// ─── Feature 8 – Export Deduction Breakdown ──────────────────────────────────

export function exportDeductionBreakdown(
  payrollRecords: PayrollRecord[],
  employees: Employee[],
  period: string
): void {
  const rows: string[][] = [
    ['Employee ID', 'Employee Name', 'Department', 'Deduction Type', 'Amount', 'Period'],
  ];
  payrollRecords.forEach(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    r.deductions.forEach(d => {
      rows.push([
        emp?.employeeId ?? '',
        r.employeeName,
        emp?.department ?? '',
        d.name,
        d.amount.toFixed(2),
        r.period,
      ]);
    });
  });
  const safe = period.replace(/[^a-zA-Z0-9-]/g, '_');
  downloadCSV(`Deduction_Breakdown_${safe}.csv`, rows);
}

// ─── Feature 9 – Automated / Scheduled Report ────────────────────────────────

export interface ScheduledReportConfig {
  frequency: 'monthly' | 'quarterly' | 'annually';
  email: string;
  format: 'csv';
  reportType: 'payroll-summary' | 'earnings' | 'deductions';
}

/** Saves configuration to localStorage and returns confirmation text. */
export function scheduleReport(config: ScheduledReportConfig): string {
  localStorage.setItem('scheduledReportConfig', JSON.stringify({ ...config, savedAt: new Date().toISOString() }));
  return `Automated ${config.reportType} report scheduled ${config.frequency} → ${config.email}`;
}

export function getScheduledReport(): ScheduledReportConfig | null {
  const raw = localStorage.getItem('scheduledReportConfig');
  return raw ? JSON.parse(raw) : null;
}

// ─── Feature 10 – Export Employee Earnings Summary ───────────────────────────

export interface EarningsSummaryRow {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  basicPay: number;
  overtimePay: number;
  holidayPay: number;
  bonuses: number;
  grossPay: number;
  tax: number;
  sss: number;
  philHealth: number;
  pagIbig: number;
  totalDeductions: number;
  netPay: number;
  payrollCount: number;
}

export function aggregateEarningsSummary(
  payrollRecords: PayrollRecord[],
  employees: Employee[]
): EarningsSummaryRow[] {
  // Group records by employee
  const grouped = new Map<string, PayrollRecord[]>();
  payrollRecords.forEach(r => {
    const prev = grouped.get(r.employeeId) ?? [];
    grouped.set(r.employeeId, [...prev, r]);
  });

  return employees
    .filter(emp => grouped.has(emp.id))
    .map(emp => {
      const records = grouped.get(emp.id)!;
      const sum = (fn: (r: PayrollRecord) => number) =>
        parseFloat(records.reduce((s, r) => s + fn(r), 0).toFixed(2));

      return {
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        position: emp.position,
        basicPay: sum(r => r.basicPay),
        overtimePay: sum(r => r.overtimePay),
        holidayPay: sum(r => r.holidayPay),
        bonuses: sum(r => r.bonuses),
        grossPay: sum(r => r.grossPay),
        tax: sum(r => r.deductions.find(d => d.type === 'tax')?.amount ?? 0),
        sss: sum(r => r.deductions.find(d => d.type === 'sss')?.amount ?? 0),
        philHealth: sum(r => r.deductions.find(d => d.type === 'philhealth')?.amount ?? 0),
        pagIbig: sum(r => r.deductions.find(d => d.type === 'pagibig')?.amount ?? 0),
        totalDeductions: sum(r => r.totalDeductions),
        netPay: sum(r => r.netPay),
        payrollCount: records.length,
      };
    });
}

export function exportEarningsSummary(
  payrollRecords: PayrollRecord[],
  employees: Employee[],
  label: string
): void {
  const data = aggregateEarningsSummary(payrollRecords, employees);

  const rows: string[][] = [
    [
      'Employee ID', 'Name', 'Department', 'Position',
      'Basic Pay', 'Overtime Pay', 'Holiday Pay', 'Bonuses', 'Total Earnings',
      'Withholding Tax', 'SSS', 'PhilHealth', 'Pag-IBIG',
      'Total Deductions', 'Net Pay', 'Pay Periods',
    ],
    ...data.map(r => [
      r.employeeId,
      r.name,
      r.department,
      r.position,
      r.basicPay.toFixed(2),
      r.overtimePay.toFixed(2),
      r.holidayPay.toFixed(2),
      r.bonuses.toFixed(2),
      r.grossPay.toFixed(2),
      r.tax.toFixed(2),
      r.sss.toFixed(2),
      r.philHealth.toFixed(2),
      r.pagIbig.toFixed(2),
      r.totalDeductions.toFixed(2),
      r.netPay.toFixed(2),
      String(r.payrollCount),
    ]),
  ];

  // Totals row
  const total = (key: keyof EarningsSummaryRow) =>
    data.reduce((s, r) => s + (r[key] as number), 0).toFixed(2);

  rows.push([
    'TOTAL', '', '', '',
    total('basicPay'), total('overtimePay'), total('holidayPay'), total('bonuses'), total('grossPay'),
    total('tax'), total('sss'), total('philHealth'), total('pagIbig'),
    total('totalDeductions'), total('netPay'),
    String(data.reduce((s, r) => s + r.payrollCount, 0)),
  ]);

  const safe = label.replace(/[^a-zA-Z0-9-]/g, '_');
  downloadCSV(`Employee_Earnings_Summary_${safe}.csv`, rows);
}
