import { useState, useMemo, useRef } from 'react';
import {
  Download, FileBarChart, TrendingUp, Bell,
  CheckCircle, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { PayrollRecord, Employee, Deduction } from '../types/payroll';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  exportReports,
  exportChartAsImage,
  exportDeductionBreakdown,
  exportEarningsSummary,
  aggregateEarningsSummary,
  scheduleReport,
  getScheduledReport,
  type ScheduledReportConfig,
} from '../utils/exportUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

// ── Colour Palette ─────────────────────────────────────────────────────────────
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const existing = getScheduledReport();
const DEFAULT_SCHEDULE: ScheduledReportConfig = existing ?? {
  frequency: 'monthly',
  email: '',
  format: 'csv',
  reportType: 'payroll-summary',
};

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('march-2026');
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduledReportConfig>({ ...DEFAULT_SCHEDULE });

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch records, employees, and the earnings summary view
    const [recRes, empRes, sumRes] = await Promise.all([
      supabase.from('payroll_records').select('*, deductions(*)'),
      supabase.from('employees').select('*'),
      supabase.from('employee_earnings_summary').select('*')
    ]);

    if (recRes.error) console.error('Error fetching records:', recRes.error);
    if (empRes.error) console.error('Error fetching employees:', empRes.error);
    if (sumRes.error) console.error('Error fetching summary view:', sumRes.error);

    setRecords(recRes.data || []);
    setEmployees(empRes.data || []);
    setSummaryData(sumRes.data || []);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Chart data ──────────────────────────────────────────────────────────────

  const departmentChartData = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach(emp => {
      const payrolls = records.filter(p => p.employee_id === emp.id);
      payrolls.forEach(p => {
        map[emp.department] = (map[emp.department] ?? 0) + Number(p.net_pay);
      });
    });
    return Object.entries(map).map(([department, amount], i) => ({ id: `d${i}`, department, amount: Math.round(amount) }));
  }, [employees, records]);

  const deductionChartData = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r =>
      r.deductions.forEach(d => { map[d.type] = (map[d.type] ?? 0) + Number(d.amount); })
    );
    return Object.entries(map).map(([type, value], i) => ({
      id: `ded${i}`, name: type.toUpperCase(), value: Math.round(value),
    }));
  }, [records]);

  // ── Earnings Summary aggregation ────────────────────────────────────────────

  const earningsSummary = useMemo(() => {
    return summaryData.map(s => ({
      employeeId: s.employee_id,
      name: s.employee_name,
      position: s.position,
      department: s.department,
      grossPay: s.total_gross_pay,
      tax: s.total_tax,
      sss: s.total_sss,
      philHealth: s.total_philhealth,
      pagIbig: s.total_pagibig,
      totalDeductions: s.total_deductions_sum,
      netPay: s.total_net_pay,
      payrollCount: s.payroll_count
    }));
  }, [summaryData]);

  const totalPayroll    = records.reduce((s, p) => s + Number(p.net_pay), 0);
  const totalDeductions = records.reduce((s, p) => s + Number(p.total_deductions), 0);
  const avgSalary       = records.length ? totalPayroll / records.length : 0;

  const fmt = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  // ── Feature 6: Export All Reports ──────────────────────────────────────────

  const handleExportAll = () => {
    exportReports(records, employees, selectedPeriod);
    showToast('Full payroll report exported as CSV.');
  };

  const handleExportChart = () => {
    exportChartAsImage('dept-chart-container', `Payroll_by_Department_${selectedPeriod}.png`);
    showToast('Department chart exported as PNG.');
  };

  const handleExportDeductions = () => {
    exportDeductionBreakdown(records, employees, selectedPeriod);
    showToast('Deduction breakdown exported as CSV.');
  };

  // ── Feature 9: Schedule Automated Report ──────────────────────────────────

  const handleSaveSchedule = () => {
    if (!scheduleForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showToast('Please enter a valid email address.');
      return;
    }
    const msg = scheduleReport(scheduleForm);
    setScheduleOpen(false);
    showToast(msg);
  };

  // ── Feature 10: Export Employee Earnings Summary ───────────────────────────

  const handleExportEarnings = () => {
    exportEarningsSummary(records, employees, selectedPeriod);
    showToast('Employee Earnings Summary exported as CSV.');
  };

  // ── Available report templates ─────────────────────────────────────────────

  const reportTemplates = [
    { name: 'Payroll Summary Report',          description: 'Complete payroll overview for selected period',      action: handleExportAll },
    { name: 'Employee Earnings Summary',        description: 'Aggregated earnings per employee across periods',    action: handleExportEarnings, highlight: true },
    { name: 'Deduction Report',                 description: 'All deductions categorised and totalled',            action: handleExportDeductions },
    { name: 'Government Contribution Report',   description: 'SSS, PhilHealth, and Pag-IBIG contributions',       action: handleExportDeductions },
    { name: 'Department Payroll Cost',          description: 'Payroll costs grouped by department (chart + CSV)', action: handleExportChart },
    { name: 'Year-End Summary',                 description: 'Annual payroll summary and statistics',              action: handleExportAll },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-blue-600 text-white">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reports &amp; Analytics</h2>
          <p className="text-gray-600 mt-1">View payroll insights and generate reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="march-2026">March 2026</SelectItem>
              <SelectItem value="february-2026">February 2026</SelectItem>
              <SelectItem value="january-2026">January 2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setScheduleOpen(true)}>
            <Bell className="w-4 h-4 mr-2" /> Schedule
          </Button>
          <Button onClick={handleExportAll}>
            <Download className="w-4 h-4 mr-2" /> Export All Reports
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Payroll Cost', value: fmt(totalPayroll), sub: 'Current period', color: 'blue', Icon: TrendingUp },
          { label: 'Total Deductions',   value: fmt(totalDeductions), sub: 'All employees',  color: 'red',  Icon: FileBarChart },
          { label: 'Average Salary',     value: fmt(avgSalary), sub: 'Per employee',   color: 'green', Icon: TrendingUp },
        ].map(({ label, value, sub, color, Icon }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className="text-2xl font-semibold mt-2">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{sub}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-50`}>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature 7 – Department Bar Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payroll by Department</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportChart}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="dept-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={v => `₱${Number(v).toLocaleString()}`} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="amount" fill="#3b82f6" name="Total Payroll" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature 8 – Deduction Pie Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Deduction Breakdown</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportDeductions}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deductionChartData}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {deductionChartData.map((entry, index) => (
                    <Cell key={`cell-${entry.id}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => `₱${Number(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates (Feature 6) */}
      <Card>
        <CardHeader><CardTitle>Available Reports</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map(report => (
              <div
                key={report.name}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  report.highlight ? 'border-blue-300 bg-blue-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded flex-shrink-0 ${report.highlight ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <FileBarChart className={`w-5 h-5 ${report.highlight ? 'text-blue-700' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1 text-sm">
                      {report.name}
                      {report.highlight && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full">New</span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{report.description}</p>
                    <Button
                      variant={report.highlight ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={report.action}
                    >
                      <Download className="w-3 h-3 mr-1" /> Generate &amp; Export
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature 10 – Employee Earnings Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee Earnings Summary</CardTitle>
            <Button onClick={handleExportEarnings}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    { label: 'Employee',      align: 'left'  },
                    { label: 'Department',    align: 'left'  },
                    { label: 'Gross Pay',     align: 'right' },
                    { label: 'Tax',           align: 'right' },
                    { label: 'SSS',           align: 'right' },
                    { label: 'PhilHealth',    align: 'right' },
                    { label: 'Pag-IBIG',      align: 'right' },
                    { label: 'Deductions',    align: 'right' },
                    { label: 'Net Pay',       align: 'right' },
                    { label: 'Periods',       align: 'center'},
                  ].map(({ label, align }) => (
                    <th
                      key={label}
                      className={`py-3 px-3 font-medium text-gray-600 text-${align}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {earningsSummary.map(row => (
                  <tr key={row.employeeId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">
                      <p>{row.name}</p>
                      <p className="text-xs text-gray-400">{row.position}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{row.department}</td>
                    <td className="py-3 px-3 text-right">{fmt(row.grossPay)}</td>
                    <td className="py-3 px-3 text-right text-red-600">{fmt(row.tax)}</td>
                    <td className="py-3 px-3 text-right text-red-600">{fmt(row.sss)}</td>
                    <td className="py-3 px-3 text-right text-red-600">{fmt(row.philHealth)}</td>
                    <td className="py-3 px-3 text-right text-red-600">{fmt(row.pagIbig)}</td>
                    <td className="py-3 px-3 text-right font-medium text-red-600">{fmt(row.totalDeductions)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-green-600">{fmt(row.netPay)}</td>
                    <td className="py-3 px-3 text-center text-gray-500">{row.payrollCount}</td>
                  </tr>
                ))}

                {/* Totals row */}
                {earningsSummary.length > 0 && (() => {
                  const sum = (k: keyof (typeof earningsSummary)[0]) =>
                    earningsSummary.reduce((s, r) => s + (r[k] as number), 0);
                  return (
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                      <td className="py-3 px-3" colSpan={2}>TOTAL ({earningsSummary.length} employees)</td>
                      <td className="py-3 px-3 text-right">{fmt(sum('grossPay'))}</td>
                      <td className="py-3 px-3 text-right text-red-600">{fmt(sum('tax'))}</td>
                      <td className="py-3 px-3 text-right text-red-600">{fmt(sum('sss'))}</td>
                      <td className="py-3 px-3 text-right text-red-600">{fmt(sum('philHealth'))}</td>
                      <td className="py-3 px-3 text-right text-red-600">{fmt(sum('pagIbig'))}</td>
                      <td className="py-3 px-3 text-right text-red-600">{fmt(sum('totalDeductions'))}</td>
                      <td className="py-3 px-3 text-right text-green-600">{fmt(sum('netPay'))}</td>
                      <td className="py-3 px-3 text-center">{earningsSummary.reduce((s, r) => s + r.payrollCount, 0)}</td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Feature 9 – Automated Report Scheduling Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Schedule Automated Report
            </DialogTitle>
            <DialogDescription>
              Configure automatic report generation. Reports will be simulated and saved locally.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Report Type */}
            <div className="space-y-1">
              <Label>Report Type</Label>
              <Select
                value={scheduleForm.reportType}
                onValueChange={v => setScheduleForm(f => ({ ...f, reportType: v as ScheduledReportConfig['reportType'] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payroll-summary">Payroll Summary</SelectItem>
                  <SelectItem value="earnings">Employee Earnings Summary</SelectItem>
                  <SelectItem value="deductions">Deduction Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency */}
            <div className="space-y-1">
              <Label>Frequency</Label>
              <Select
                value={scheduleForm.frequency}
                onValueChange={v => setScheduleForm(f => ({ ...f, frequency: v as ScheduledReportConfig['frequency'] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly (1st of each month)</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label>Send To (Email)</Label>
              <Input
                type="email"
                placeholder="hr@company.com"
                value={scheduleForm.email}
                onChange={e => setScheduleForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <p className="text-xs text-gray-400">
              Note: In this demo, settings are saved to localStorage. In production, this would register a server-side cron job.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSchedule}>
              <CheckCircle className="w-4 h-4 mr-2" /> Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}