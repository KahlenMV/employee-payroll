import { useState } from 'react';
import { Download, FileText, Printer, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { PayrollRecord, Employee } from '../types/payroll';
import { Badge } from '../components/ui/badge';
import { printPayslip } from '../utils/exportUtils';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';

export function Payslips() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [periods, setPeriods] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [recRes, empRes, perRes] = await Promise.all([
      supabase.from('payroll_records').select('*, deductions(*)'),
      supabase.from('employees').select('*'),
      supabase.from('payroll_periods').select('*')
    ]);

    if (recRes.error) console.error(recRes.error);
    if (empRes.error) console.error(empRes.error);

    setRecords(recRes.data || []);
    setEmployees(empRes.data || []);
    setPeriods(perRes.data || []);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filteredPayslips = records.filter(record => {
    const matchesEmployee = selectedEmployee === 'all' || record.employee_id === selectedEmployee;
    const matchesPeriod = selectedPeriod === 'all' || record.period_label === selectedPeriod;
    return matchesEmployee && matchesPeriod;
  });

  const previewRecord = filteredPayslips[0];
  const employee = employees.find(e => e.id === previewRecord?.employee_id);

  const fmt = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  // ── Feature 5: Download Payslip as PDF (via browser print) ──────────────

  const handleDownload = () => {
    if (!previewRecord) return;
    printPayslip('payslip-preview');
    showToast('Payslip sent to print / save as PDF.');
  };

  const handlePrint = () => {
    if (!previewRecord) return;
    printPayslip('payslip-preview');
  };

  const getStatusBadge = (status: string) =>
    status === 'paid'
      ? 'bg-green-100 text-green-800'
      : status === 'processed'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-blue-600 text-white">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold">Payslip Generation</h2>
        <p className="text-gray-600 mt-1">View and download employee payslips</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map(p => (
                    <SelectItem key={p.id} value={p.period_label}>{p.period_label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {previewRecord && (
              <div className="pt-2 border-t space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Showing:</span> {filteredPayslips.length} record(s)</p>
                <p><span className="font-medium">Net Pay:</span> {fmt(previewRecord.net_pay)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payslip Preview */}
        {previewRecord && employee ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payslip Preview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" /> Print
                  </Button>
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Printable area */}
              <div id="payslip-preview" className="border rounded-lg p-6 bg-white space-y-6">
                {/* Company Header */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-xl font-bold">Company Name Inc.</h3>
                  <p className="text-sm text-gray-600">123 Business Street, Makati City, Metro Manila</p>
                  <p className="text-sm text-gray-600">payroll@company.com</p>
                </div>

                <div className="text-center">
                  <h4 className="text-lg font-bold">PAYSLIP</h4>
                  <p className="text-sm text-gray-600">Period: {previewRecord.period_label}</p>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b text-sm">
                  {[
                    ['Employee Name', employee.name],
                    ['Employee ID', employee.employee_id],
                    ['Position', employee.position],
                    ['Department', employee.department],
                    ['Tax ID (TIN)', employee.tax_id],
                    ['Bank Account', employee.bank_account],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-500">{label ?? ''}</p>
                      <p className="font-medium">{val ?? '-'}</p>
                    </div>
                  ))}
                </div>

                {/* Earnings / Deductions side-by-side */}
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div>
                    <h5 className="font-semibold mb-3 uppercase tracking-wide text-xs text-gray-500">Earnings</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-600">Basic Pay</span><span className="font-medium">{fmt(previewRecord.basic_pay)}</span></div>
                      {previewRecord.overtime_pay > 0 && (
                        <div className="flex justify-between"><span className="text-gray-600">Overtime Pay</span><span className="font-medium">{fmt(previewRecord.overtime_pay)}</span></div>
                      )}
                      {previewRecord.holiday_pay > 0 && (
                        <div className="flex justify-between"><span className="text-gray-600">Holiday Pay</span><span className="font-medium">{fmt(previewRecord.holiday_pay)}</span></div>
                      )}
                      {previewRecord.bonuses > 0 && (
                        <div className="flex justify-between"><span className="text-gray-600">Bonuses</span><span className="font-medium">{fmt(previewRecord.bonuses)}</span></div>
                      )}
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Gross Pay</span><span>{fmt(previewRecord.gross_pay)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-3 uppercase tracking-wide text-xs text-gray-500">Deductions</h5>
                    <div className="space-y-2">
                      {previewRecord.deductions.map(d => (
                        <div key={d.id} className="flex justify-between">
                          <span className="text-gray-600">{d.name}</span>
                          <span className="font-medium text-red-600">{fmt(d.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Deductions</span>
                        <span className="text-red-600">{fmt(previewRecord.total_deductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-gray-50 rounded-lg p-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">NET PAY</span>
                    <span className="text-2xl font-bold text-green-600">{fmt(previewRecord.net_pay)}</span>
                  </div>
                </div>

                {/* Government Contributions */}
                <div className="border-t pt-4">
                  <h5 className="font-semibold mb-3 text-xs uppercase tracking-wide text-gray-500">Government Contributions</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {[
                      ['SSS Number', employee.sss_number],
                      ['PhilHealth Number', employee.philhealth_number],
                      ['Pag-IBIG Number', employee.pagibig_number],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs text-gray-500">{label ?? ''}</p>
                        <p className="font-medium">{val ?? '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 pt-4 border-t">
                  <p>This is a computer-generated payslip and does not require a signature.</p>
                  <p>Generated on: {new Date(previewRecord.generated_date).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 flex items-center justify-center min-h-64">
            <p className="text-gray-400">No payslip matches the selected filters.</p>
          </Card>
        )}
      </div>

      {/* Payslip History */}
      <Card>
        <CardHeader><CardTitle>Payslip History</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Employee','Period','Net Pay','Status','Actions'].map(h => (
                    <th key={h} className={`py-3 px-4 text-sm font-medium text-gray-600 ${h === 'Net Pay' ? 'text-right' : h === 'Actions' ? 'text-center' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayslips.map(record => {
                  const emp = employees.find(e => e.id === record.employee_id);
                  return (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{emp?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.period_label}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium">{fmt(record.net_pay)}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadge(record.status)}>{record.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedEmployee(record.employee_id)}>
                            <FileText className="w-4 h-4 mr-1" /> View
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => {
                              setSelectedEmployee(record.employee_id);
                              setTimeout(() => printPayslip('payslip-preview'), 200);
                              showToast('Payslip sent to printer.');
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" /> Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPayslips.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
