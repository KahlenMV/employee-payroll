import { useState } from 'react';
import { Search, Edit, Eye, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { Employee, EmploymentStatus } from '../types/payroll';
import { generateEmployeeId, calcHourlyRate } from '../utils/exportUtils';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error';
interface Toast { message: string; type: ToastType }

const EMPTY_FORM = {
  name: '', position: '', department: '', status: '' as EmploymentStatus | '',
  basicPay: '', email: '', hireDate: '', taxId: '', sssNumber: '',
  philHealthNumber: '', pagIbigNumber: '', bankAccount: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  // ── Data Fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('employee_id', { ascending: true });

    if (error) {
      showToast('Error fetching employees: ' + error.message, 'error');
    } else {
      setEmployees(data || []);
      if (data && data.length > 0 && !selectedEmployee) {
        setSelectedEmployee(data[0]);
      }
    }
    setLoading(false);
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'regular': return 'bg-green-100 text-green-800';
      case 'contractual': return 'bg-blue-100 text-blue-800';
      case 'probationary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = (f: typeof EMPTY_FORM) => {
    const errs: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
    if (!f.name.trim()) errs.name = 'Required';
    if (!f.position.trim()) errs.position = 'Required';
    if (!f.department) errs.department = 'Required';
    if (!f.status) errs.status = 'Required';
    if (!f.basicPay || isNaN(Number(f.basicPay)) || Number(f.basicPay) <= 0)
      errs.basicPay = 'Must be positive';
    if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Invalid email';
    if (!f.hireDate) errs.hireDate = 'Required';
    return errs;
  };

  // ── Add Employee ─────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const basicPayNum = Number(form.basicPay);
    const hourlyRate = calcHourlyRate(basicPayNum);
    
    const { data, error } = await supabase
      .from('employees')
      .insert([{
        employee_id: generateEmployeeId(employees),
        name: form.name.trim(),
        position: form.position.trim(),
        department: form.department,
        status: form.status,
        basic_pay: basicPayNum,
        hourly_rate: hourlyRate,
        email: form.email.trim(),
        hire_date: form.hireDate,
        tax_id: form.taxId.trim() || null,
        sss_number: form.sssNumber.trim() || null,
        philhealth_number: form.philHealthNumber.trim() || null,
        pagibig_number: form.pagIbigNumber.trim() || null,
        bank_account: form.bankAccount.trim() || null,
      }])
      .select();

    if (error) {
      showToast('Error adding employee: ' + error.message, 'error');
    } else {
      setEmployees(prev => [...prev, data[0]]);
      setForm({ ...EMPTY_FORM });
      setAddOpen(false);
      showToast(`${data[0].name} (${data[0].employee_id}) added successfully.`);
    }
  };

  // ── Edit Employee ────────────────────────────────────────────────────────────

  const openEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditForm({
      name: emp.name, position: emp.position, department: emp.department,
      status: emp.status, basicPay: String(emp.basic_pay), email: emp.email,
      hireDate: emp.hire_date, taxId: emp.tax_id || '', sssNumber: emp.sss_number || '',
      philHealthNumber: emp.philhealth_number || '', pagIbigNumber: emp.pagibig_number || '',
      bankAccount: emp.bank_account || '',
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedEmployee) return;
    const errs = validate(editForm);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const basicPayNum = Number(editForm.basicPay);
    const hourlyRate = calcHourlyRate(basicPayNum);

    const { data, error } = await supabase
      .from('employees')
      .update({
        name: editForm.name.trim(),
        position: editForm.position.trim(),
        department: editForm.department,
        status: editForm.status,
        basic_pay: basicPayNum,
        hourly_rate: hourlyRate,
        email: editForm.email.trim(),
        hire_date: editForm.hireDate,
        tax_id: editForm.taxId.trim(),
        sss_number: editForm.sssNumber.trim(),
        philhealth_number: editForm.philHealthNumber.trim(),
        pagibig_number: editForm.pagIbigNumber.trim(),
        bank_account: editForm.bankAccount.trim(),
      })
      .eq('id', selectedEmployee.id)
      .select();

    if (error) {
      showToast('Error updating employee: ' + error.message, 'error');
    } else {
      setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? data[0] : e));
      setEditOpen(false);
      showToast(`${editForm.name} updated successfully.`);
    }
  };

  // ── Delete Employee ──────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteId) return;
    const emp = employees.find(e => e.id === deleteId);
    
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', deleteId);

    if (error) {
      showToast('Error deleting employee: ' + error.message, 'error');
    } else {
      setEmployees(prev => prev.filter(e => e.id !== deleteId));
      setDeleteId(null);
      showToast(`${emp?.name} removed from the system.`, 'error');
    }
  };

  // ── Field helper ─────────────────────────────────────────────────────────────

  const fieldClass = (err?: string) =>
    `${err ? 'border-red-500 focus-visible:ring-red-500' : ''}`;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Employee Management</h2>
          <p className="text-gray-600 mt-1">Manage employee information and records</p>
        </div>

        {/* Add Employee Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm({ ...EMPTY_FORM }); setErrors({}); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Fill in the required fields to register a new employee.</DialogDescription>
            </DialogHeader>
            <EmployeeForm
              f={form} setF={setForm} errors={errors}
              employees={employees} fieldClass={fieldClass}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Save Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, ID or department…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <span className="text-sm text-gray-500">{filteredEmployees.length} employees</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Employee ID','Name','Position','Department','Status','Basic Pay','Actions'].map(h => (
                    <th key={h} className={`py-3 px-4 text-sm font-medium text-gray-600 ${h === 'Actions' ? 'text-center' : h === 'Basic Pay' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">No employees found.</td>
                  </tr>
                )}
                {filteredEmployees.map(employee => (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{employee.employee_id}</td>
                    <td className="py-3 px-4 text-sm">{employee.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{employee.position}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{employee.department}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">₱{employee.basic_pay.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* View */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedEmployee(employee)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Employee Details</DialogTitle>
                              <DialogDescription>Read-only view of employee record.</DialogDescription>
                            </DialogHeader>
                            {selectedEmployee && (
                              <div className="grid grid-cols-2 gap-4 py-4">
                                {[
                                  ['Employee ID', selectedEmployee.employee_id],
                                  ['Full Name', selectedEmployee.name],
                                  ['Position', selectedEmployee.position],
                                  ['Department', selectedEmployee.department],
                                  ['Hire Date', new Date(selectedEmployee.hire_date).toLocaleDateString()],
                                  ['Basic Pay', `₱${selectedEmployee.basic_pay.toLocaleString()}`],
                                  ['Hourly Rate', `₱${selectedEmployee.hourly_rate.toLocaleString()}`],
                                  ['Email', selectedEmployee.email],
                                  ['Bank Account', selectedEmployee.bank_account],
                                  ['TIN', selectedEmployee.tax_id],
                                  ['SSS', selectedEmployee.sss_number],
                                  ['PhilHealth', selectedEmployee.philhealth_number],
                                  ['Pag-IBIG', selectedEmployee.pagibig_number],
                                ].map(([label, val]) => (
                                  <div key={label}>
                                    <p className="text-sm text-gray-500">{label}</p>
                                    <p className="font-medium text-sm">{val}</p>
                                  </div>
                                ))}
                                <div>
                                  <p className="text-sm text-gray-500">Status</p>
                                  <Badge className={getStatusColor(selectedEmployee.status)}>
                                    {selectedEmployee.status}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Edit */}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(employee)}>
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost" size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setDeleteId(employee.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update {selectedEmployee?.name}'s information.</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            f={editForm} setF={setEditForm} errors={errors}
            employees={employees} fieldClass={fieldClass}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Reusable Employee Form ───────────────────────────────────────────────────

interface EmployeeFormProps {
  f: typeof EMPTY_FORM;
  setF: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  errors: Partial<Record<keyof typeof EMPTY_FORM, string>>;
  employees: Employee[];
  fieldClass: (err?: string) => string;
}

function EmployeeForm({ f, setF, errors, fieldClass }: EmployeeFormProps) {
  const set = (key: keyof typeof EMPTY_FORM) =>
    (val: string) => setF(prev => ({ ...prev, [key]: val }));
  const onChange = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setF(prev => ({ ...prev, [key]: e.target.value }));

  // Helper to safely get error message
  const getError = (key: keyof typeof EMPTY_FORM) => errors[key];

  return (
    <div className="grid grid-cols-2 gap-4 py-4">
      {/* Full Name */}
      <div className="space-y-1">
        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
        <Input id="name" value={f.name} onChange={onChange('name')} className={fieldClass(getError('name'))} placeholder="e.g. Maria Santos" />
        {getError('name') && <p className="text-xs text-red-500">{getError('name')}</p>}
      </div>

      {/* Position */}
      <div className="space-y-1">
        <Label htmlFor="position">Position <span className="text-red-500">*</span></Label>
        <Input id="position" value={f.position} onChange={onChange('position')} className={fieldClass(getError('position'))} placeholder="e.g. Software Engineer" />
        {getError('position') && <p className="text-xs text-red-500">{getError('position')}</p>}
      </div>

      {/* Department */}
      <div className="space-y-1">
        <Label>Department <span className="text-red-500">*</span></Label>
        <Select value={f.department} onValueChange={set('department')}>
          <SelectTrigger className={fieldClass(getError('department'))}>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {['Engineering','Marketing','Human Resources','Finance','Sales','Operations'].map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getError('department') && <p className="text-xs text-red-500">{getError('department')}</p>}
      </div>

      {/* Status */}
      <div className="space-y-1">
        <Label>Employment Status <span className="text-red-500">*</span></Label>
        <Select value={f.status} onValueChange={set('status')}>
          <SelectTrigger className={fieldClass(getError('status'))}>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="contractual">Contractual</SelectItem>
            <SelectItem value="probationary">Probationary</SelectItem>
          </SelectContent>
        </Select>
        {getError('status') && <p className="text-xs text-red-500">{getError('status')}</p>}
      </div>

      {/* Basic Pay */}
      <div className="space-y-1">
        <Label htmlFor="basicPay">Basic Pay (₱) <span className="text-red-500">*</span></Label>
        <Input id="basicPay" type="number" value={f.basicPay} onChange={onChange('basicPay')} className={fieldClass(getError('basicPay'))} placeholder="50000" min={1} />
        {getError('basicPay') && <p className="text-xs text-red-500">{getError('basicPay')}</p>}
        {f.basicPay && !isNaN(Number(f.basicPay)) && (
          <p className="text-xs text-gray-400">Hourly rate: ₱{calcHourlyRate(Number(f.basicPay)).toFixed(2)}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
        <Input id="email" type="email" value={f.email} onChange={onChange('email')} className={fieldClass(getError('email'))} placeholder="name@company.com" />
        {getError('email') && <p className="text-xs text-red-500">{getError('email')}</p>}
      </div>

      {/* Hire Date */}
      <div className="space-y-1">
        <Label htmlFor="hireDate">Hire Date <span className="text-red-500">*</span></Label>
        <Input id="hireDate" type="date" value={f.hireDate} onChange={onChange('hireDate')} className={fieldClass(getError('hireDate'))} />
        {getError('hireDate') && <p className="text-xs text-red-500">{getError('hireDate')}</p>}
      </div>

      {/* TIN */}
      <div className="space-y-1">
        <Label htmlFor="taxId">Tax ID (TIN)</Label>
        <Input id="taxId" value={f.taxId} onChange={onChange('taxId')} placeholder="123-456-789" />
      </div>

      {/* SSS */}
      <div className="space-y-1">
        <Label htmlFor="sss">SSS Number</Label>
        <Input id="sss" value={f.sssNumber} onChange={onChange('sssNumber')} placeholder="34-1234567-8" />
      </div>

      {/* PhilHealth */}
      <div className="space-y-1">
        <Label htmlFor="philhealth">PhilHealth Number</Label>
        <Input id="philhealth" value={f.philHealthNumber} onChange={onChange('philHealthNumber')} placeholder="12-345678901-2" />
      </div>

      {/* Pag-IBIG */}
      <div className="space-y-1">
        <Label htmlFor="pagibig">Pag-IBIG Number</Label>
        <Input id="pagibig" value={f.pagIbigNumber} onChange={onChange('pagIbigNumber')} placeholder="1234-5678-9012" />
      </div>

      {/* Bank Account */}
      <div className="space-y-1">
        <Label htmlFor="bank">Bank Account</Label>
        <Input id="bank" value={f.bankAccount} onChange={onChange('bankAccount')} placeholder="BDO-1234567890" />
      </div>
    </div>
  );
}
