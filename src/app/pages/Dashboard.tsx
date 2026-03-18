import { Users, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import type { PayrollRecord, Employee } from '../types/payroll';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [statsData, setStatsData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayroll: 0,
    pendingLeaves: 0,
    todayPresent: 0
  });
  const [recentPayroll, setRecentPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    const [empRes, payrollRes, leaveRes, attRes] = await Promise.all([
      supabase.from('employees').select('id, status'),
      supabase.from('payroll_records').select('*').order('generated_date', { ascending: false }).limit(5),
      supabase.from('leave_requests').select('id').eq('status', 'pending'),
      supabase.from('attendance').select('id').eq('date', today).in('status', ['present', 'late'])
    ]);

    const employees = empRes.data || [];
    const payroll = payrollRes.data || [];
    
    // Total payroll (net pay) from last 30 days or similar - for now just sum what we have or mock it
    // Actually let's just sum the recent ones or fetch a larger set for total
    const { data: monthlyPayroll } = await supabase.from('payroll_records').select('net_pay');
    const totalNet = (monthlyPayroll || []).reduce((sum, p) => sum + (p.net_pay || 0), 0);

    setStatsData({
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === 'regular').length,
      totalPayroll: totalNet,
      pendingLeaves: (leaveRes.data || []).length,
      todayPresent: (attRes.data || []).length
    });
    setRecentPayroll(payroll);
    setLoading(false);
  };

  const { totalEmployees, activeEmployees, totalPayroll, pendingLeaves, todayPresent } = statsData;

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
                    <td className="py-3 px-4 text-sm font-medium">{record.employee_name || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{record.period_label}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{(record.gross_pay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">-₱{(record.total_deductions || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">₱{(record.net_pay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
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
                {recentPayroll.length === 0 && !loading && (
                   <tr><td colSpan={6} className="text-center py-6 text-gray-400">No recent payroll activity.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/payroll">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Process Payroll</h3>
              <p className="text-sm text-gray-600">Calculate and process payroll for the current period</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Generate Reports</h3>
              <p className="text-sm text-gray-600">Create payroll and attendance reports</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/employees">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Manage Employees</h3>
              <p className="text-sm text-gray-600">Add or update employee information</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
