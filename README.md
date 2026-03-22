# Employee Payroll Web App

## 📝 Project Info
This is a modern Employee Payroll Management System designed to streamline HR and financial operations. It provides a centralized dashboard for managing employee records, attendance, payroll processing, and financial reporting.

**Figma Design Reference**: [Employee Payroll Web App](https://www.figma.com/design/I5SXE0JkZzKdwDxSGqh6VI/Employee-Payroll-Web-App)

## 🎯 What it's about
The application transitions from simple mock data to a robust, cloud-based infrastructure using Supabase. It enables HR managers to:
- Maintain a digital database of employees with detailed profiles.
- Track daily attendance and manage leave requests (Sick, Vacation, Emergency).
- Process payroll periodically with automatic calculation of basic pay, overtime, and deductions (Tax, SSS, PhilHealth, Pag-IBIG).
- Generate and view payslips for individual employees.
- Monitor company-wide earnings and department performance through interactive reports.

## 🛠️ Tech Stack
- **Frontend**: React (with Vite)
- **Styling**: Tailwind CSS & Lucide Icons
- **Components**: Radix UI & Shadcn/UI
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Router**: React Router 7

## 🚀 Important Commands

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 🔄 Workflow

### 1. Database Setup
- Run the schema in `supabase_schema.sql` to create tables and views.
- (Optional) Run `supabase_security_fixes.sql` to enable RLS and add demo-friendly policies.
- (Optional) Run `supabase_seed_data.sql` to populate the DB with demo records.

### 2. Employee Management
- Navigate to the **Employees** tab to add new staff or update existing profiles.

### 3. Attendance & Leave
- Log daily attendance in the **Attendance** tab.
- Review and approve/reject leave requests.

### 4. Payroll Processing
- Go to the **Payroll** tab.
- Select an open payroll period.
- Click **Process Payroll** to generate records and save them to the database.

### 5. Reporting
- Visit the **Reports** tab to see visual summaries and export the **Earnings Summary** as a CSV/Excel file.