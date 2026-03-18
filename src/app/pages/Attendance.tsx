import { useState } from 'react';
import { Calendar, Clock, Download, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockEmployees, mockAttendance, mockLeaveRequests } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import type { LeaveRequest } from '../types/payroll';
import { applyLeaveDecision, exportAttendanceAndLeave } from '../utils/exportUtils';

export function Attendance() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'on-leave': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter attendance by selected year
  const attendanceFiltered = mockAttendance.filter(a => a.date.startsWith(selectedYear));

  const totalHoursWorked = attendanceFiltered.reduce((sum, a) => sum + a.hoursWorked, 0);
  const totalOvertime = attendanceFiltered.reduce((sum, a) => sum + a.overtime, 0);
  const presentCount = attendanceFiltered.filter(a => a.status === 'present' || a.status === 'late').length;

  // ── Feature 3: Approve / Reject Leave ─────────────────────────────────────

  const handleLeaveDecision = (id: string, decision: 'approved' | 'rejected') => {
    const req = leaveRequests.find(r => r.id === id);
    if (!req) return;
    setLeaveRequests(prev => applyLeaveDecision(prev, id, decision));
    showToast(
      `Leave request for ${req.employeeName} has been ${decision}.`,
      decision === 'approved' ? 'success' : 'error'
    );
  };

  // ── Feature 2: Export Attendance & Leave ──────────────────────────────────

  const handleExport = () => {
    exportAttendanceAndLeave(
      mockAttendance,
      mockEmployees,
      leaveRequests,
      Number(selectedYear)
    );
    showToast(`Attendance & Leave exported for ${selectedYear}.`);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Attendance &amp; Time Tracking</h2>
          <p className="text-gray-600 mt-1">Monitor employee attendance and leave requests</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">Year 2026</SelectItem>
              <SelectItem value="2025">Year 2025</SelectItem>
              <SelectItem value="2024">Year 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours Worked</p>
                <p className="text-2xl font-semibold mt-2">{totalHoursWorked.toFixed(1)}h</p>
                <p className="text-xs text-gray-500 mt-1">Year {selectedYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Overtime Hours</p>
                <p className="text-2xl font-semibold mt-2">{totalOvertime.toFixed(1)}h</p>
                <p className="text-xs text-gray-500 mt-1">Year {selectedYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Present / Total Records</p>
                <p className="text-2xl font-semibold mt-2">{presentCount}/{attendanceFiltered.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Attendance rate:{' '}
                  {attendanceFiltered.length
                    ? ((presentCount / attendanceFiltered.length) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="leaves">
            Leave Requests
            {leaveRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-yellow-500 text-white rounded-full">
                {leaveRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Daily Attendance */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Records — {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Date','Employee','Time In','Time Out','Hours','Overtime','Status'].map(h => (
                        <th key={h} className={`py-3 px-4 text-sm font-medium text-gray-600 ${['Hours','Overtime'].includes(h) ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceFiltered.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400">No records for {selectedYear}.</td></tr>
                    )}
                    {attendanceFiltered.map(record => {
                      const employee = mockEmployees.find(e => e.id === record.employeeId);
                      return (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-sm font-medium">{employee?.name ?? '—'}</td>
                          <td className="py-3 px-4 text-sm">{record.timeIn || '—'}</td>
                          <td className="py-3 px-4 text-sm">{record.timeOut || '—'}</td>
                          <td className="py-3 px-4 text-sm text-right">{record.hoursWorked.toFixed(1)}h</td>
                          <td className="py-3 px-4 text-sm text-right">
                            {record.overtime > 0 ? `${record.overtime.toFixed(1)}h` : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Requests */}
        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Employee','Leave Type','Start Date','End Date','Days','Reason','Status','Actions'].map(h => (
                        <th key={h} className={`py-3 px-4 text-sm font-medium text-gray-600 ${h === 'Days' ? 'text-center' : h === 'Actions' ? 'text-center' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map(request => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{request.employeeName}</td>
                        <td className="py-3 px-4 text-sm capitalize">{request.leaveType}</td>
                        <td className="py-3 px-4 text-sm">{new Date(request.startDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm">{new Date(request.endDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm text-center">{request.days}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-[160px] truncate" title={request.reason}>
                          {request.reason}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getLeaveStatusColor(request.status)}>{request.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {request.status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:bg-green-50 border-green-200"
                                  onClick={() => handleLeaveDecision(request.id, 'approved')}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50 border-red-200"
                                  onClick={() => handleLeaveDecision(request.id, 'rejected')}
                                >
                                  <XCircle className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                {request.status === 'approved' ? 'Approved ✓' : 'Rejected ✗'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
