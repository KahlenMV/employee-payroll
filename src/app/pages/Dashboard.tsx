import { Users, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { mockEmployees, mockPayrollRecords, mockAttendance, mockLeaveRequests } from '../data/mockData';

export function Dashboard() {
  const totalEmployees = mockEmployees.length;
  const activeEmployees = mockEmployees.filter(e => e.status !== 'probationary').length;
  const totalPayroll = mockPayrollRecords.reduce((sum, p) => sum + p.netPay, 0);
  const pendingLeaves = mockLeaveRequests.filter(l => l.status === 'pending').length;
  const todayPresent = mockAttendance.filter(a => a.status === 'present').length;

  const recentPayroll = mockPayrollRecords.slice(0, 5);

  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      subtitle: `${activeEmployees} active`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Monthly Payroll',
      value: `₱${totalPayroll.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      subtitle: 'This period',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Present Today',
      value: todayPresent,
      subtitle: `${totalEmployees - todayPresent} absent/leave`,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Pending Requests',
      value: pendingLeaves,
      subtitle: 'Leave requests',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's your payroll overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Payroll */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Period</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Gross Pay</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Deductions</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Net Pay</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayroll.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{record.employeeName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{record.period}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{record.grossPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">-₱{record.totalDeductions.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">₱{record.netPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'processed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Process Payroll</h3>
            <p className="text-sm text-gray-600">Calculate and process payroll for the current period</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Generate Reports</h3>
            <p className="text-sm text-gray-600">Create payroll and attendance reports</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Manage Employees</h3>
            <p className="text-sm text-gray-600">Add or update employee information</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
