import { useState } from 'react';
import { Calculator, DollarSign, Download, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockPayrollRecords, mockEmployees, mockAttendance } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import type { PayrollRecord } from '../types/payroll';
import { processPayroll, exportReports } from '../utils/exportUtils';

// ── Period options metadata ────────────────────────────────────────────────────

const PERIODS = [
  { value: 'feb-16-28-2026', label: 'February 16–28, 2026', start: '2026-02-16', end: '2026-02-28' },
  { value: 'feb-1-15-2026',  label: 'February 1–15, 2026',  start: '2026-02-01', end: '2026-02-15' },
  { value: 'jan-16-31-2026', label: 'January 16–31, 2026',  start: '2026-01-16', end: '2026-01-31' },
] as const;

type PeriodValue = typeof PERIODS[number]['value'];

export function Payroll() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>('feb-16-28-2026');
  const [records, setRecords] = useState<PayrollRecord[]>(mockPayrollRecords);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord>(records[0]);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentPeriodMeta = PERIODS.find(p => p.value === selectedPeriod)!;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Summary totals (for the currently shown records)
  const totalGrossPay     = records.reduce((s, p) => s + p.grossPay, 0);
  const totalDeductions   = records.reduce((s, p) => s + p.totalDeductions, 0);
  const totalNetPay       = records.reduce((s, p) => s + p.netPay, 0);
  const processedCount    = records.filter(p => p.status !== 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':      return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'pending':   return 'bg-yellow-100 text-yellow-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  // ── Feature 4: Process Payroll ─────────────────────────────────────────────

  const handleProcessPayroll = () => {
    setProcessing(true);
    // Simulate async processing (e.g. API call or heavy computation)
    setTimeout(() => {
      try {
        const newRecords = processPayroll({
          employees: mockEmployees,
          attendance: mockAttendance,
          period: currentPeriodMeta.label,
          periodType: 'semi-monthly',
          periodStart: currentPeriodMeta.start,
          periodEnd: currentPeriodMeta.end,
        }, records);
        setRecords(newRecords);
        setSelectedRecord(newRecords[0]);
        showToast(`Payroll processed for ${currentPeriodMeta.label} — ${newRecords.length} employee(s) updated.`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Processing failed.');
      } finally {
        setProcessing(false);
      }
    }, 800);
  };

  // ── Feature 6 (partial): Export to Excel from Payroll tab ─────────────────

  const handleExport = () => {
    exportReports(records, mockEmployees, currentPeriodMeta.label);
    showToast('Payroll report exported as CSV.');
  };

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
          <h2 className="text-2xl font-semibold">Payroll Processing</h2>
          <p className="text-gray-600 mt-1">Calculate and process employee payroll</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedPeriod} onValueChange={v => setSelectedPeriod(v as PeriodValue)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleProcessPayroll}
            disabled={processing}
            className="flex items-center gap-2"
          >
            {processing
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Play className="w-4 h-4" />
            }
            {processing ? 'Processing…' : 'Process Payroll'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Gross Pay', value: `₱${totalGrossPay.toLocaleString('en-PH', {minimumFractionDigits:2})}`, color: 'blue', Icon: DollarSign },
          { label: 'Total Deductions', value: `₱${totalDeductions.toLocaleString('en-PH', {minimumFractionDigits:2})}`, color: 'red', Icon: Calculator },
          { label: 'Total Net Pay', value: `₱${totalNetPay.toLocaleString('en-PH', {minimumFractionDigits:2})}`, color: 'green', Icon: DollarSign },
        ].map(({ label, value, color, Icon }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className={`text-xl font-semibold mt-2 ${color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : ''}`}>
                    {value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-50`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-xl font-semibold mt-2">{processedCount}/{records.length}</p>
                <p className="text-xs text-gray-500 mt-1">employees</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payroll Records — {currentPeriodMeta.label}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Employee','Basic Pay','Overtime','Holiday Pay','Bonuses','Gross Pay','Deductions','Net Pay','Status','Actions'].map(h => (
                    <th key={h} className={`py-3 px-4 text-sm font-medium text-gray-600
                      ${['Actions','Status'].includes(h) ? 'text-center' : ['Basic Pay','Overtime','Holiday Pay','Bonuses','Gross Pay','Deductions','Net Pay'].includes(h) ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{record.employeeName}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{record.basicPay.toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{record.overtimePay.toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{record.holidayPay.toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{record.bonuses.toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">₱{record.grossPay.toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">-₱{record.totalDeductions.toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">₱{record.netPay.toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payroll Details — {selectedRecord.employeeName}</DialogTitle>
                            <DialogDescription>
                              Period: {selectedRecord.period} · Status: {selectedRecord.status}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {[
                                ['Period Type', selectedRecord.periodType],
                                ['Generated', new Date(selectedRecord.generatedDate).toLocaleDateString()],
                              ].map(([k, v]) => (
                                <div key={k}><p className="text-gray-500">{k}</p><p className="font-medium">{v}</p></div>
                              ))}
                            </div>

                            {/* Earnings */}
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Earnings</h4>
                              <div className="space-y-2 text-sm">
                                {[
                                  ['Basic Pay', selectedRecord.basicPay],
                                  ['Overtime Pay', selectedRecord.overtimePay],
                                  ['Holiday Pay', selectedRecord.holidayPay],
                                  ['Bonuses', selectedRecord.bonuses],
                                ].map(([label, amount]) => (
                                  <div key={label as string} className="flex justify-between">
                                    <span className="text-gray-600">{label as string}</span>
                                    <span className="font-medium">₱{(amount as number).toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                  <span>Gross Pay</span>
                                  <span>₱{selectedRecord.grossPay.toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                                </div>
                              </div>
                            </div>

                            {/* Deductions */}
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Deductions</h4>
                              <div className="space-y-2 text-sm">
                                {selectedRecord.deductions.map(d => (
                                  <div key={d.id} className="flex justify-between">
                                    <span className="text-gray-600">{d.name}</span>
                                    <span className="font-medium text-red-600">-₱{d.amount.toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                  <span>Total Deductions</span>
                                  <span className="text-red-600">-₱{selectedRecord.totalDeductions.toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                                </div>
                              </div>
                            </div>

                            {/* Net Pay */}
                            <div className="border-t pt-4">
                              <div className="flex justify-between text-lg font-bold">
                                <span>Net Pay</span>
                                <span className="text-green-600">₱{selectedRecord.netPay.toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}