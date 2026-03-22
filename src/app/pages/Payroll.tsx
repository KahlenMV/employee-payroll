import { useState } from 'react';
import { Calculator, DollarSign, Download, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import type { PayrollRecord, Employee, Attendance, Deduction } from '../types/payroll';
import { processPayroll, exportReports } from '../utils/exportUtils';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';

// ── Period options metadata ────────────────────────────────────────────────────

const PERIODS = [
  { value: 'mar-2026', label: 'March 2026',    start: '2026-03-01', end: '2026-03-31' },
  { value: 'feb-2026', label: 'February 2026', start: '2026-02-01', end: '2026-02-28' },
  { value: 'jan-2026', label: 'January 2026',  start: '2026-01-01', end: '2026-01-31' },
] as const;

type PeriodValue = typeof PERIODS[number]['value'];

export function Payroll() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>('mar-2026');
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [periodId, setPeriodId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    const meta = PERIODS.find(p => p.value === selectedPeriod)!;

    // 1. Get or Ensure Period exists
    let pId: string | null = null;
    const { data: pData, error: pError } = await supabase
      .from('payroll_periods')
      .select('id')
      .eq('period_label', meta.label)
      .single();
    
    if (pError || !pData) {
      const { data: newP, error: newPError } = await supabase
        .from('payroll_periods')
        .insert({
          period_label: meta.label,
          period_start: meta.start,
          period_end: meta.end,
          period_type: 'monthly'
        })
        .select()
        .single();
      if (newPError) showToast('Error creating period: ' + newPError.message);
      pId = newP?.id || null;
    } else {
      pId = pData.id;
    }
    setPeriodId(pId);

    if (!pId) { setLoading(false); return; }

    // 2. Fetch records, employees, and attendance
    const [recRes, empRes, attRes] = await Promise.all([
      supabase.from('payroll_records').select('*, deductions(*)').eq('period_id', pId),
      supabase.from('employees').select('*'),
      supabase.from('attendance').select('*').gte('date', meta.start).lte('date', meta.end)
    ]);

    if (recRes.error) showToast('Error fetching records: ' + recRes.error.message);
    if (empRes.error) showToast('Error fetching employees: ' + empRes.error.message);
    if (attRes.error) showToast('Error fetching attendance: ' + attRes.error.message);

    const fetchedRecords = (recRes.data || []).map(r => ({
      ...r,
      employee_name: (empRes.data || []).find(e => e.id === r.employee_id)?.name
    }));

    setRecords(fetchedRecords);
    setEmployees(empRes.data || []);
    setAttendance(attRes.data || []);
    if (fetchedRecords.length > 0) setSelectedRecord(fetchedRecords[0]);
    setLoading(false);
  };

  const currentPeriodMeta = PERIODS.find(p => p.value === selectedPeriod)!;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Summary totals (for the currently shown records)
  const totalGrossPay     = records.reduce((s, p) => s + (p.gross_pay || 0), 0);
  const totalDeductions   = records.reduce((s, p) => s + (p.total_deductions || 0), 0);
  const totalNetPay       = records.reduce((s, p) => s + (p.net_pay || 0), 0);
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

  const handleProcessPayroll = async () => {
    if (!periodId) return;
    setProcessing(true);
    try {
      const newRecords = processPayroll({
        employees: employees,
        attendance: attendance,
        period: currentPeriodMeta.label,
        periodType: 'monthly',
        periodStart: currentPeriodMeta.start,
        periodEnd: currentPeriodMeta.end,
      }, records);

      // Save to Supabase (Sequential to handle foreign keys)
      for (const r of newRecords) {
        // 1. Upsert Record
        const { data: savedRecord, error: recError } = await supabase
          .from('payroll_records')
          .upsert({
            employee_id: r.employee_id,
            period_id: periodId,
            basic_pay: r.basic_pay,
            overtime_pay: r.overtime_pay,
            holiday_pay: r.holiday_pay,
            bonuses: r.bonuses,
            gross_pay: r.gross_pay,
            total_deductions: r.total_deductions,
            net_pay: r.net_pay,
            status: 'processed',
          }, { onConflict: 'employee_id,period_id' })
          .select()
          .single();

        if (recError) throw recError;

        // 2. Delete existing deductions for this record to refresh
        await supabase.from('deductions').delete().eq('payroll_record_id', savedRecord.id);

        // 3. Insert new deductions
        const { error: dedError } = await supabase
          .from('deductions')
          .insert(r.deductions.map((d: Deduction) => ({
            payroll_record_id: savedRecord.id,
            name: d.name,
            amount: d.amount,
            type: d.type
          })));
        
        if (dedError) throw dedError;
      }

      await fetchData(); // Refresh all
      showToast(`Payroll processed and saved for ${currentPeriodMeta.label}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Feature 6 (partial): Export to Excel from Payroll tab ─────────────────

  const handleExport = () => {
    exportReports(records, employees, currentPeriodMeta.label);
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
                    <td className="py-3 px-4 text-sm font-medium">{record.employee_name || '—'}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{(record.basic_pay || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{(record.overtime_pay || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{(record.holiday_pay || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{(record.bonuses || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">₱{(record.gross_pay || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">-₱{(record.total_deductions || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">₱{(record.net_pay || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
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
                            <DialogTitle>Payroll Details — {selectedRecord?.employee_name || 'Employee'}</DialogTitle>
                            <DialogDescription>
                              Period: {selectedRecord?.period_label} · Status: {selectedRecord?.status}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {[
                                ['Period Type', selectedRecord?.period_type],
                                ['Generated', selectedRecord?.generated_date ? new Date(selectedRecord.generated_date).toLocaleDateString() : '—'],
                              ].map(([k, v]) => (
                                <div key={k as string}><p className="text-gray-500">{k as string}</p><p className="font-medium">{v as string}</p></div>
                              ))}
                            </div>

                            {/* Earnings */}
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Earnings</h4>
                              <div className="space-y-2 text-sm">
                                {[
                                  ['Basic Pay', selectedRecord?.basic_pay],
                                  ['Overtime Pay', selectedRecord?.overtime_pay],
                                  ['Holiday Pay', selectedRecord?.holiday_pay],
                                  ['Bonuses', selectedRecord?.bonuses],
                                ].map(([label, amount]) => (
                                  <div key={label as string} className="flex justify-between">
                                    <span className="text-gray-600">{label as string}</span>
                                    <span className="font-medium">₱{(amount as number || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                  <span>Gross Pay</span>
                                  <span>₱{(selectedRecord?.gross_pay || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                                </div>
                              </div>
                            </div>

                            {/* Deductions */}
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Deductions</h4>
                              <div className="space-y-2 text-sm">
                                {selectedRecord?.deductions.map(d => (
                                  <div key={d.id} className="flex justify-between">
                                    <span className="text-gray-600">{d.name}</span>
                                    <span className="font-medium text-red-600">-₱{d.amount.toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                  <span>Total Deductions</span>
                                  <span className="text-red-600">-₱{(selectedRecord?.total_deductions || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
                                </div>
                              </div>
                            </div>

                            {/* Net Pay */}
                             <div className="border-t pt-4">
                               <div className="flex justify-between text-lg font-bold">
                                 <span>Net Pay</span>
                                 <span className="text-green-600">₱{(selectedRecord?.net_pay || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
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