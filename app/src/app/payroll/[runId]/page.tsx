import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ChevronLeft,
    Download,
    Lock,
    Printer,
    RotateCcw,
    Send,
    Eye,
    FileText
} from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"

export default async function PayrollRunDetailPage({ params }: { params: { runId: string } }) {
    const { runId } = params

    let run: any = null

    try {
        run = await prisma.payrollRun.findUnique({
            where: { id: runId },
            include: {
                payrollRecords: {
                    include: { employee: true }
                }
            }
        })
    } catch (error) {
        console.error("DB Fetch failed, using mock run", error)
        if (runId === '1' || runId === '2') {
            run = {
                id: runId,
                name: runId === '1' ? 'Feb 2026 Monthly' : 'Mar 2026 Monthly (Draft)',
                periodStart: new Date(runId === '1' ? '2026-02-01' : '2026-03-01'),
                periodEnd: new Date(runId === '1' ? '2026-02-28' : '2026-03-31'),
                status: runId === '1' ? 'COMMITTED' : 'DRAFT',
                payrollRecords: [
                    {
                        id: 'rec1',
                        employee: { id: 1, firstName: "Ree", lastName: "Talton", department: "Operations" },
                        grossPay: 6558.75,
                        incomeTax: 1049.40,
                        ficaTax: 501.74,
                        postTaxDeductions: 185,
                        netPay: 4822.61,
                    },
                    {
                        id: 'rec2',
                        employee: { id: 2, firstName: "Murvyn", lastName: "Lucks", department: "Marketing" },
                        grossPay: 5200.00,
                        incomeTax: 832.00,
                        ficaTax: 397.80,
                        postTaxDeductions: 120,
                        netPay: 3850.20,
                    }
                ]
            }
        }
    }

    if (!run) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href="/payroll">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to History
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{run.name || "Payroll Run"}</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge variant={run.status === 'COMMITTED' ? 'default' : 'secondary'}>
                            {run.status}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                            Period: {format(run.periodStart, "MMM d")} - {format(run.periodEnd, "MMM d, yyyy")}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {run.status === 'DRAFT' ? (
                        <>
                            <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Reprocess</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <Lock className="mr-2 h-4 w-4" /> Commit Payroll
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Batch CSV</Button>
                            <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print All Payslips</Button>
                            <Button disabled className="opacity-50">
                                <Send className="mr-2 h-4 w-4" /> Sent to Employees
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-none shadow-sm card-gradient">
                    <CardHeader>
                        <CardTitle>Run Summary</CardTitle>
                        <CardDescription>Aggregate figures for this pay period.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Gross</p>
                            <p className="text-2xl font-bold font-mono tracking-tight">$11,758.75</p>
                        </div>
                        <div className="space-y-1 text-rose-500">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Taxes</p>
                            <p className="text-2xl font-bold font-mono tracking-tight">$2,780.94</p>
                        </div>
                        <div className="space-y-1 text-primary">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Deductions</p>
                            <p className="text-2xl font-bold font-mono tracking-tight">$305.00</p>
                        </div>
                        <div className="space-y-1 text-emerald-500">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Net</p>
                            <p className="text-2xl font-bold font-mono tracking-tight">$8,672.81</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="rounded-xl border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Employee</TableHead>
                                <TableHead>Gross</TableHead>
                                <TableHead>Income Tax</TableHead>
                                <TableHead>FICA</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead>Net Pay</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {run.payrollRecords.map((record: any) => (
                                <TableRow key={record.id} className="hover:bg-muted/30 transition-colors group">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{record.employee.firstName} {record.employee.lastName}</span>
                                            <span className="text-xs text-muted-foreground italic uppercase tracking-tighter">{record.employee.department}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">${record.grossPay.toLocaleString()}</TableCell>
                                    <TableCell className="font-mono text-sm text-rose-500">-${record.incomeTax.toLocaleString()}</TableCell>
                                    <TableCell className="font-mono text-sm text-rose-500">-${record.ficaTax.toLocaleString()}</TableCell>
                                    <TableCell className="font-mono text-sm text-primary">-${record.postTaxDeductions.toLocaleString()}</TableCell>
                                    <TableCell className="font-bold text-emerald-500 font-mono tracking-tight">${record.netPay.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FileText className="h-4 w-4 mr-2" /> Breakdown
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
