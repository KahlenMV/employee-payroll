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
-- Using DROP VIEW first to ensure column name changes are applied correctly.
DROP VIEW IF EXISTS employee_earnings_summary;

CREATE VIEW employee_earnings_summary 
WITH (security_invoker = true) AS
SELECT 
  e.id as primary_id,
  e.employee_id,
  e.name as employee_name,
  e.department,
  e.position,
  COALESCE(SUM(pr.gross_pay), 0) as total_gross_pay,
  COALESCE(SUM(pr.net_pay), 0) as total_net_pay,
  COALESCE((SELECT SUM(d.amount) FROM deductions d JOIN payroll_records pr2 ON d.payroll_record_id = pr2.id WHERE pr2.employee_id = e.id AND d.type = 'tax'), 0) as total_tax,
  COALESCE((SELECT SUM(d.amount) FROM deductions d JOIN payroll_records pr2 ON d.payroll_record_id = pr2.id WHERE pr2.employee_id = e.id AND d.type = 'sss'), 0) as total_sss,
  COALESCE((SELECT SUM(d.amount) FROM deductions d JOIN payroll_records pr2 ON d.payroll_record_id = pr2.id WHERE pr2.employee_id = e.id AND d.type = 'philhealth'), 0) as total_philhealth,
  COALESCE((SELECT SUM(d.amount) FROM deductions d JOIN payroll_records pr2 ON d.payroll_record_id = pr2.id WHERE pr2.employee_id = e.id AND d.type = 'pagibig'), 0) as total_pagibig,
  COALESCE(SUM(pr.total_deductions), 0) as total_deductions_sum,
  COUNT(pr.id) as payroll_count
FROM employees e
LEFT JOIN payroll_records pr ON e.id = pr.employee_id
GROUP BY e.id, e.employee_id, e.name, e.department, e.position;

-- 4. Transition to Monthly Payroll Periods
-- Update existing periods and insert new monthly ones
UPDATE payroll_periods SET period_type = 'monthly', status = 'open' WHERE period_type = 'semi-monthly';

INSERT INTO payroll_periods (period_label, period_start, period_end, period_type)
VALUES 
  ('March 2026', '2026-03-01', '2026-03-31', 'monthly'),
  ('February 2026', '2026-02-01', '2026-02-28', 'monthly'),
  ('January 2026', '2026-01-01', '2026-01-31', 'monthly')
ON CONFLICT (period_label) DO NOTHING;
