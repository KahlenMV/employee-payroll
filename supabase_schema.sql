-- SUPABASE SQL SCHEMA FOR EMPLOYEE PAYROLL APP

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT UNIQUE NOT NULL, -- e.g. EMP001
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('regular', 'contractual', 'probationary')),
  basic_pay DECIMAL(12, 2) NOT NULL,
  hourly_rate DECIMAL(12, 4) NOT NULL,
  tax_id TEXT,
  sss_number TEXT,
  philhealth_number TEXT,
  pagibig_number TEXT,
  bank_account TEXT,
  email TEXT UNIQUE NOT NULL,
  hire_date DATE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_in TIME,
  time_out TIME,
  hours_worked DECIMAL(5, 2) DEFAULT 0,
  overtime DECIMAL(5, 2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'on-leave')),
  leave_type TEXT CHECK (leave_type IN ('sick', 'vacation', 'emergency')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Leave Requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'vacation', 'emergency')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payroll Periods table
CREATE TABLE IF NOT EXISTS payroll_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_label TEXT UNIQUE NOT NULL, -- e.g., "February 16-28, 2026"
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'semi-monthly', 'monthly')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Payroll Records table
CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  period_id UUID REFERENCES payroll_periods(id) ON DELETE CASCADE,
  basic_pay DECIMAL(12, 2) NOT NULL,
  overtime_pay DECIMAL(12, 2) DEFAULT 0,
  holiday_pay DECIMAL(12, 2) DEFAULT 0,
  bonuses DECIMAL(12, 2) DEFAULT 0,
  gross_pay DECIMAL(12, 2) NOT NULL,
  total_deductions DECIMAL(12, 2) NOT NULL,
  net_pay DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processed', 'paid')),
  generated_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Deductions table
CREATE TABLE IF NOT EXISTS deductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tax', 'sss', 'philhealth', 'pagibig', 'loan', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SQL View for Earnings Summary (Security Invoker)
CREATE OR REPLACE VIEW employee_earnings_summary 
WITH (security_invoker = true) AS
SELECT 
  e.id as primary_id,
  e.employee_id,
  e.name,
  e.department,
  e.position,
  COALESCE(SUM(pr.basic_pay), 0) as total_basic,
  COALESCE(SUM(pr.overtime_pay), 0) as total_overtime,
  COALESCE(SUM(pr.holiday_pay), 0) as total_holiday,
  COALESCE(SUM(pr.bonuses), 0) as total_bonuses,
  COALESCE(SUM(pr.gross_pay), 0) as total_gross,
  COALESCE(SUM(pr.total_deductions), 0) as total_deductions,
  COALESCE(SUM(pr.net_pay), 0) as total_net,
  COUNT(pr.id) as payroll_count
FROM employees e
LEFT JOIN payroll_records pr ON e.id = pr.employee_id
GROUP BY e.id, e.employee_id, e.name, e.department, e.position;

-- 9. Row Level Security & Policies (Requirement for Supabase)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE deductions ENABLE ROW LEVEL SECURITY;

-- Note: Permissive policies for Demo purposes
CREATE POLICY "Public Access" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON leave_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON payroll_periods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON payroll_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON deductions FOR ALL USING (true) WITH CHECK (true);

-- 10. Seed Data for Payroll Periods
INSERT INTO payroll_periods (period_label, period_start, period_end, period_type)
VALUES 
  ('February 16-28, 2026', '2026-02-16', '2026-02-28', 'semi-monthly'),
  ('February 1-15, 2026', '2026-02-01', '2026-02-15', 'semi-monthly'),
  ('January 16-31, 2026', '2026-01-16', '2026-01-31', 'semi-monthly')
ON CONFLICT (period_label) DO NOTHING;
