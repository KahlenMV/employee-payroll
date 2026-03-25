# 💼 Employee Payroll System

A modern, full-stack payroll management solution built with **React**, **Vite**, and **Supabase**. Streamline your HR operations with automated payroll processing, attendance tracking, and comprehensive financial reporting.

---

## ✨ Key Features

- **👥 Employee Directory**: Centralized management of employee profiles, positions, and departments.
- **📅 Smart Attendance**: Track daily attendance, overtime, and leave requests with ease.
- **💰 Automated Payroll**: Process monthly payroll with automatic calculation of taxes (SSS, PhilHealth, Pag-IBIG) and deductions.
- **📄 Digital Payslips**: Generate and download professional PDF payslips for all employees.
- **📊 Interactive Reports**: Visualize company performance and export financial summaries (CSV/Excel).
- **🔒 Secure Backend**: Powered by Supabase with Row Level Security (RLS) and PostgreSQL.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), TypeScript |
| **Styling** | Tailwind CSS, Lucide Icons |
| **UI Components** | Radix UI, Shadcn/UI |
| **Database** | Supabase (PostgreSQL) |
| **Charts** | Recharts |
| **Navigation** | React Router 7 |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Supabase account (for database hosting)

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
1. Execute `supabase_schema.sql` in your Supabase SQL Editor.
2. (Optional) Run `supabase_security_fixes.sql` for demo policies.
3. Run `supabase_enhanced_seed_data.sql` to populate the database with a large sample dataset.

### 5. Running the App
```bash
npm run dev
```

---

## 📂 Project Structure

- `/src/app/pages`: Core application views (Dashboard, Employees, Payroll, etc.)
- `/src/app/components`: Reusable UI elements.
- `/src/app/utils`: Helper functions for calculations and formatting.
- `/*.sql`: Database schema and seed data scripts.

---

## 📄 License
This project is for demonstration purposes.

---

> [!TIP]
> Use the **Process Payroll** button in the Payroll tab to generate records for the current open period based on logged attendance.