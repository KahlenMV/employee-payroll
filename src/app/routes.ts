import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
import { Attendance } from "./pages/Attendance";
import { Payroll } from "./pages/Payroll";
import { Payslips } from "./pages/Payslips";
import { Reports } from "./pages/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "employees", Component: Employees },
      { path: "attendance", Component: Attendance },
      { path: "payroll", Component: Payroll },
      { path: "payslips", Component: Payslips },
      { path: "reports", Component: Reports },
    ],
  },
]);
