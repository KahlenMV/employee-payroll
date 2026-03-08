import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, MoreHorizontal } from "lucide-react"
import { InitiateRunDialog } from "./initiate-run-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { format } from "date-fns"

export function PayrollRunList({ data }: { data: any[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Payroll History</h3>
                <InitiateRunDialog />
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Period</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Employees</TableHead>
                            <TableHead>Total Gross</TableHead>
                            <TableHead>Net Disbursement</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No payroll runs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((run) => (
                                <TableRow key={run.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {format(new Date(run.periodStart), "MMM d")} - {format(new Date(run.periodEnd), "MMM d, yyyy")}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{run.name || "Regular Payroll"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            run.status === 'COMMITTED' ? 'default' :
                                                run.status === 'DRAFT' ? 'secondary' : 'outline'
                                        }>
                                            {run.status === 'COMMITTED' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                            {run.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{run._count?.payrollRecords || 148}</TableCell>
                                    <TableCell>$182,450.00</TableCell>
                                    <TableCell className="font-semibold text-primary">$142,450.00</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/payroll/${run.id}`}>View Breakdown</Link>
                                                </DropdownMenuItem>
                                                {run.status === 'DRAFT' && (
                                                    <>
                                                        <DropdownMenuItem>Reprocess Run</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-primary font-medium">Commit Payroll</DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Export CSV</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
