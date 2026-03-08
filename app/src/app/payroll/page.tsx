import { PayrollRunList } from "@/components/payroll/payroll-run-list"
import prisma from "@/lib/prisma"

export default async function PayrollPage() {
    let payrollRuns: any[] = []

    try {
        payrollRuns = await prisma.payrollRun.findMany({
            orderBy: { periodStart: 'desc' },
            include: {
                _count: {
                    select: { payrollRecords: true }
                }
            }
        })
    } catch (error) {
        console.error("Failed to fetch payroll runs, using mock data for now", error)
        // Mock data for preview
        payrollRuns = [
            { id: '1', name: 'Feb 2026 Monthly', periodStart: new Date('2026-02-01'), periodEnd: new Date('2026-02-28'), status: 'COMMITTED', _count: { payrollRecords: 148 } },
            { id: '2', name: 'Mar 2026 Monthly (Draft)', periodStart: new Date('2026-03-01'), periodEnd: new Date('2026-03-31'), status: 'DRAFT', _count: { payrollRecords: 148 } }
        ]
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient">Payroll Management</h2>
                <p className="text-muted-foreground">
                    Process payroll, view history, and manage disbursements.
                </p>
            </div>

            <div className="grid gap-6">
                <PayrollRunList data={payrollRuns} />
            </div>
        </div>
    )
}
