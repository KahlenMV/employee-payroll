I am building a payroll web application. Most functionalities are already implemented and working, but I need to clearly define, validate, and ensure correct behavior for the following features:

1. Add Employee (Employee Tab)
2. Export Attendance and Leave Requests (filtered by selected year)
3. Approve/Reject Leave Requests (Attendance Tab)
4. Process Payroll (based on selected date range)
5. Generate and Download Payslip as PDF (filtered by employee and payroll period)
6. Export Reports (Reports Tab)
7. Export Payroll by Department Graph (as image or PDF)
8. Export Deduction Breakdown
9. Automated Report Generation (scheduled)

Additionally, one feature is NOT yet implemented:
10. Export Employee Earnings Summary

-------------------------------------

GENERAL REQUIREMENTS:
- Focus only on backend logic, data handling, validation, and system behavior
- Do NOT include UI design or styling
- Ensure all features behave like a production-level payroll system
- Use clear, structured, and implementation-ready explanations
- Include pseudocode or query logic where applicable

-------------------------------------

FOR EACH FEATURE, PROVIDE:

1. Functional Behavior
   - Step-by-step system flow
   - Input → Process → Output

2. Validation Rules
   - Required fields
   - Error handling
   - Edge cases (e.g., empty data, duplicates, invalid date ranges)

3. Data Handling
   - What data is retrieved
   - How it is filtered and processed

4. Output Specification
   - File format (CSV, Excel, PDF, Image)
   - Structure of exported data

5. Acceptance Criteria
   - Clear conditions that define when the feature is “working correctly”

6. Self-Validation / Test Cases
   - Provide at least 3 test scenarios per feature
   - Include:
     - Input
     - Expected behavior
     - Expected output

-------------------------------------

FOR THE MISSING FEATURE:
EXPORT EMPLOYEE EARNINGS SUMMARY

Provide:

1. Full backend logic
2. Data aggregation rules (grouping, summation)
3. SQL query or pseudocode
4. Output file structure (columns and format)
5. File naming convention
6. Handling of large datasets
7. Acceptance criteria
8. Self-validation test cases

The export must include:
- Employee ID
- Employee Name
- Department
- Total Basic Pay
- Total Overtime Pay
- Total Bonuses
- Total Earnings

-------------------------------------

SELF-CHECKING INSTRUCTIONS FOR THE AI:

After generating the solution, perform the following checks:

1. Completeness Check
   - Ensure ALL 10 features are covered
   - Ensure each feature includes all required sections:
     (Behavior, Validation, Data Handling, Output, Acceptance Criteria, Test Cases)

2. Consistency Check
   - Ensure logic is consistent across features
   - Example:
     - Payroll data used in reports must match payroll processing logic
     - Leave approval must affect payroll calculations

3. Edge Case Check
   - Verify handling of:
     - Empty datasets
     - Invalid date ranges
     - Duplicate entries
     - Missing required fields

4. Data Integrity Check
   - Ensure no duplication of payroll records for the same date range
   - Ensure correct aggregation (no double counting)

5. Export Validation
   - Ensure all export features:
     - Use correct file formats
     - Include correct columns
     - Respect applied filters

6. Performance Consideration
   - Ensure filtering and aggregation are done in backend (not frontend)
   - Avoid loading unnecessary large datasets into memory

7. Output Verification
   - Ensure all outputs (files/reports) match expected structure and naming conventions

-------------------------------------

EXPECTED OUTPUT STYLE:

- Structured
- Clear headings per feature
- Implementation-ready (developer-friendly)
- No vague explanations