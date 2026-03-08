import { EmployeeTable } from "@/components/employees/employee-table"
import prisma from "@/lib/prisma"

export default async function EmployeesPage() {
    // We'll try to fetch from Prisma, but if it fails (no DB yet), we return empty or mock
    let employees: any[] = []

    try {
        employees = await prisma.employee.findMany({
            orderBy: { id: 'asc' },
            take: 50
        })
    } catch (error) {
        console.error("Failed to fetch employees, using empty list for now", error)
        // Mock data for preview if DB is not connected
        employees = [
            { id: 1, firstName: "Ree", lastName: "Talton", email: "rtalton0@columbia.edu", department: "Operations", position: "Supervisor", status: "ON_LEAVE" },
            { id: 2, firstName: "Murvyn", lastName: "Lucks", email: "mlucks1@clickbank.net", department: "Marketing", position: "Manager", status: "TERMINATED" },
            { id: 3, firstName: "John", lastName: "Doe", email: "john@example.com", department: "Engineering", position: "Developer", status: "ACTIVE" },
        ]
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient">Employees</h2>
                <p className="text-muted-foreground">
                    Manage your workforce, view profiles, and track employment status.
                </p>
            </div>

            <EmployeeTable data={employees} />
        </div>
    )
}
