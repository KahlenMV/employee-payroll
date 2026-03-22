-- CORRECTED SEED DATA FOR EMPLOYEE PAYROLL APP
-- Fixed UUID syntax (hexadecimal 0-9, a-f only)

-- 1. Employees
INSERT INTO employees (id, employee_id, name, position, department, status, basic_pay, hourly_rate, email, hire_date)
VALUES 
  ('a1b2c3d4-0000-0000-0000-000000000001', 'EMP001', 'John Doe', 'HR Manager', 'Human Resources', 'regular', 45000.00, 259.62, 'john.doe@example.com', '2023-01-15'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'EMP002', 'Jane Smith', 'Senior Developer', 'Engineering', 'regular', 85000.00, 490.38, 'jane.smith@example.com', '2023-03-20'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'EMP003', 'Mike Ross', 'Junior Developer', 'Engineering', 'probationary', 35000.00, 201.92, 'mike.ross@example.com', '2025-11-01'),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'EMP004', 'Rachel Zane', 'Accountant', 'Finance', 'regular', 55000.00, 317.31, 'rachel.zane@example.com', '2024-06-10'),
  ('a1b2c3d4-0000-0000-0000-000000000005', 'EMP005', 'Harvey Specter', 'Department Head', 'Management', 'regular', 120000.00, 692.31, 'harvey.specter@example.com', '2022-05-01')
ON CONFLICT (id) DO NOTHING;

-- 2. Attendance (Sample data for March 2026)
INSERT INTO attendance (id, employee_id, date, time_in, time_out, hours_worked, status)
SELECT 
  uuid_generate_v4(),
  e.id,
  d.date,
  '08:00',
  '17:00',
  9.0,
  'present'
FROM employees e
CROSS JOIN (
  SELECT generate_series('2026-03-01'::date, '2026-03-15'::date, '1 day'::interval)::date as date
) d
WHERE NOT EXISTS (SELECT 1 FROM attendance WHERE employee_id = e.id AND date = d.date)
ON CONFLICT (id) DO NOTHING;

-- 3. Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, days, reason, status)
VALUES 
  ('f1a1b1c1-1111-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000003', 'sick', CURRENT_DATE - 1, CURRENT_DATE - 1, 1, 'Fever', 'approved'),
  ('f1a1b1c1-1111-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000004', 'vacation', CURRENT_DATE + 5, CURRENT_DATE + 7, 3, 'Family trip', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 4. Payroll Records
INSERT INTO payroll_records (id, employee_id, period_id, basic_pay, overtime_pay, gross_pay, total_deductions, net_pay, status)
VALUES 
  (
    '01010101-1111-0000-0000-000000000001', 
    'a1b2c3d4-0000-0000-0000-000000000001', 
    (SELECT id FROM payroll_periods WHERE period_label = 'February 1-15, 2026' LIMIT 1),
    22500.00, 500.00, 23000.00, 2500.00, 20500.00, 'paid'
  ),
  (
    '01010101-1111-0000-0000-000000000002',
    'a1b2c3d4-0000-0000-0000-000000000002',
    (SELECT id FROM payroll_periods WHERE period_label = 'February 1-15, 2026' LIMIT 1),
    42500.00, 0.00, 42500.00, 5000.00, 37500.00, 'paid'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Deductions
INSERT INTO deductions (id, payroll_record_id, name, amount, type)
VALUES 
  ('d1010101-1111-0000-0000-000000000001', '01010101-1111-0000-0000-000000000001', 'Income Tax', 1500.00, 'tax'),
  ('d1010101-1111-0000-0000-000000000002', '01010101-1111-0000-0000-000000000001', 'SSS', 500.00, 'sss'),
  ('d1010101-1111-0000-0000-000000000003', '01010101-1111-0000-0000-000000000001', 'PhilHealth', 500.00, 'philhealth'),
  ('d1010101-1111-0000-0000-000000000004', '01010101-1111-0000-0000-000000000002', 'Income Tax', 4000.00, 'tax'),
  ('d1010101-1111-0000-0000-000000000005', '01010101-1111-0000-0000-000000000002', 'SSS', 1000.00, 'sss')
ON CONFLICT (id) DO NOTHING;
