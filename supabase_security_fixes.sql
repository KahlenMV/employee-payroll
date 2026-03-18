-- SUPABASE SECURITY FIXES
-- This script addresses the warnings from the Supabase Security Advisor.
-- Note: These policies allow public (anon) access, which is suitable for a DEMO project.

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE deductions ENABLE ROW LEVEL SECURITY;

-- 2. Create Public Access Policies (Permissive for Demo)
-- These policies allow anyone with the anon key to perform CRUD operations.

-- Employees
CREATE POLICY "Public Access" ON employees FOR ALL USING (true) WITH CHECK (true);

-- Attendance
CREATE POLICY "Public Access" ON attendance FOR ALL USING (true) WITH CHECK (true);

-- Leave Requests
CREATE POLICY "Public Access" ON leave_requests FOR ALL USING (true) WITH CHECK (true);

-- Payroll Periods
CREATE POLICY "Public Access" ON payroll_periods FOR ALL USING (true) WITH CHECK (true);

-- Payroll Records
CREATE POLICY "Public Access" ON payroll_records FOR ALL USING (true) WITH CHECK (true);

-- Deductions
CREATE POLICY "Public Access" ON deductions FOR ALL USING (true) WITH CHECK (true);

-- 3. Fix View Security (Security Invoker)
-- Redefining the view to use security_invoker = true to respect RLS of the querying user.
DROP VIEW IF EXISTS employee_earnings_summary;

CREATE VIEW employee_earnings_summary 
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
