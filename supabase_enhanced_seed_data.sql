-- ENHANCED SEED DATA FOR EMPLOYEE PAYROLL APP
-- This script generates a comprehensive dataset for testing performance and functions.
-- It includes 25+ employees, 3 months of attendance, and payroll records for Jan/Feb 2026.

-- 1. Ensure extensions and periods exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO payroll_periods (period_label, period_start, period_end, period_type, status)
VALUES 
  ('January 2026', '2026-01-01', '2026-01-31', 'monthly', 'closed'),
  ('February 2026', '2026-02-01', '2026-02-28', 'monthly', 'closed'),
  ('March 2026', '2026-03-01', '2026-03-31', 'monthly', 'open')
ON CONFLICT (period_label) DO UPDATE SET status = EXCLUDED.status;

-- 2. Generate 25 Employees
DO $$
DECLARE
    i INT;
    depts TEXT[] := ARRAY['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations'];
    pos TEXT[] := ARRAY['Software Engineer', 'Senior Developer', 'HR Specialist', 'Accountant', 'Marketing Lead', 'Sales Executive', 'Project Manager'];
    dept TEXT;
    p TEXT;
    e_id TEXT;
    sal DECIMAL;
BEGIN
    FOR i IN 1..25 LOOP
        dept := depts[1 + mod(i, array_length(depts, 1))];
        p := pos[1 + mod(i, array_length(pos, 1))];
        e_id := 'EMP' || LPAD(i::text, 3, '0');
        sal := 30000 + (random() * 70000);
        
        INSERT INTO employees (employee_id, name, position, department, status, basic_pay, hourly_rate, email, hire_date)
        VALUES (
            e_id, 
            'Employee ' || i, 
            p, 
            dept, 
            CASE WHEN i % 10 = 0 THEN 'contractual' WHEN i % 5 = 0 THEN 'probationary' ELSE 'regular' END,
            sal,
            sal / 173.33, -- Standard monthly hours
            'employee' || i || '@example.com',
            '2024-01-01'::date + (i * interval '10 days')
        ) ON CONFLICT (employee_id) DO NOTHING;
    END LOOP;
END $$;

-- 3. Generate Attendance for Jan, Feb, and March (up to current date)
-- We'll assume 8 hours worked per day for most, with some random absences/lates
INSERT INTO attendance (employee_id, date, time_in, time_out, hours_worked, status)
SELECT 
    e.id,
    d.date,
    '08:00'::TIME + (random() * interval '30 minutes'),
    '17:00'::TIME + (random() * interval '1 hour'),
    8 + (random() * 2),
    CASE 
        WHEN random() < 0.05 THEN 'absent'
        WHEN random() < 0.1 THEN 'late'
        ELSE 'present'
    END
FROM employees e
CROSS JOIN (
    SELECT generate_series('2026-01-01'::date, '2026-03-25'::date, '1 day'::interval)::date as date
) d
WHERE 
    EXTRACT(DOW FROM d.date) NOT IN (0, 6) -- Exclude weekends
    AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.employee_id = e.id AND a.date = d.date)
ON CONFLICT DO NOTHING;

-- 4. Generate Leave Requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days, reason, status)
SELECT 
    id,
    (ARRAY['sick', 'vacation', 'emergency'])[1 + floor(random() * 3)],
    '2026-03-10'::date + (floor(random() * 10) * interval '1 day'),
    '2026-03-10'::date + (floor(random() * 10 + 2) * interval '1 day'),
    3,
    'Personal reasons',
    (ARRAY['approved', 'pending', 'rejected'])[1 + floor(random() * 3)]
FROM employees
LIMIT 10
ON CONFLICT DO NOTHING;

-- 5. Generate Past Payroll Records (Jan & Feb)
DO $$
DECLARE
    emp RECORD;
    jan_id UUID;
    feb_id UUID;
    v_gross DECIMAL;
    v_deduct DECIMAL;
    v_net DECIMAL;
    v_pr_id UUID;
BEGIN
    SELECT id INTO jan_id FROM payroll_periods WHERE period_label = 'January 2026';
    SELECT id INTO feb_id FROM payroll_periods WHERE period_label = 'February 2026';

    FOR emp IN SELECT * FROM employees LOOP
        -- January
        v_gross := emp.basic_pay;
        v_deduct := v_gross * 0.15; -- Simplified 15% deductions
        v_net := v_gross - v_deduct;
        
        INSERT INTO payroll_records (employee_id, period_id, basic_pay, gross_pay, total_deductions, net_pay, status, generated_date)
        VALUES (emp.id, jan_id, emp.basic_pay, v_gross, v_deduct, v_net, 'paid', '2026-01-31')
        RETURNING id INTO v_pr_id;
        
        -- Deductions for January
        INSERT INTO deductions (payroll_record_id, name, amount, type)
        VALUES 
            (v_pr_id, 'Tax', v_gross * 0.1, 'tax'),
            (v_pr_id, 'SSS', v_gross * 0.03, 'sss'),
            (v_pr_id, 'PhilHealth', v_gross * 0.02, 'philhealth');

        -- February
        v_gross := emp.basic_pay + (random() * 2000); -- Maybe some overtime
        v_deduct := v_gross * 0.15;
        v_net := v_gross - v_deduct;
        
        INSERT INTO payroll_records (employee_id, period_id, basic_pay, gross_pay, total_deductions, net_pay, status, generated_date)
        VALUES (emp.id, feb_id, emp.basic_pay, v_gross, v_deduct, v_net, 'paid', '2026-02-28')
        RETURNING id INTO v_pr_id;
        
        -- Deductions for February
        INSERT INTO deductions (payroll_record_id, name, amount, type)
        VALUES 
            (v_pr_id, 'Tax', v_gross * 0.1, 'tax'),
            (v_pr_id, 'SSS', v_gross * 0.03, 'sss'),
            (v_pr_id, 'PhilHealth', v_gross * 0.02, 'philhealth');
    END LOOP;
END $$;
