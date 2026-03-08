import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Calendar,
    Check,
    Clock,
    X,
    History,
    Plane
} from "lucide-react"
import { LeaveRequestDialog } from "@/components/leave/leave-request-dialog"
import prisma from "@/lib/prisma"

export default async function LeavePage() {
    let leaveRequests: any[] = []

    try {
        leaveRequests = await prisma.leaveRequest.findMany({
            include: { employee: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
    } catch (error) {
        console.error("DB Fetch failed, using mock leave data")
        leaveRequests = [
            { id: 1, employee: { firstName: "Ree", lastName: "Talton" }, leaveType: "ANNUAL", startDate: new Date("2026-04-10"), endDate: new Date("2026-04-14"), status: "PENDING", reason: "Family vacation" },
            { id: 2, employee: { firstName: "Murvyn", lastName: "Lucks" }, leaveType: "SICK", startDate: new Date("2026-03-05"), endDate: new Date("2026-03-06"), status: "APPROVED", reason: "High fever" },
        ]
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Leave Management</h2>
                    <p className="text-muted-foreground">
                        Monitor organizational time-off and handle approval workflows.
                    </p>
                </div>
                <LeaveRequestDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-sm card-gradient">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires manager action</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm card-gradient">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out Today</CardTitle>
                        <Plane className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3 Employees</div>
                        <p className="text-xs text-muted-foreground mt-1">From Operations & Engineering</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm card-gradient">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Utilization</CardTitle>
                        <History className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12.4%</div>
                        <p className="text-xs text-muted-foreground mt-1">Trending below avg.</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm card-gradient">
                <CardHeader>
                    <CardTitle>Recent Leave Requests</CardTitle>
                    <CardDescription>Track and manage employee time-off requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests.map((request) => (
                                    <TableRow key={request.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium text-sm">
                                            {request.employee.firstName} {request.employee.lastName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                                                {request.leaveType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                request.status === 'APPROVED' ? 'default' :
                                                    request.status === 'PENDING' ? 'secondary' : 'destructive'
                                            }>
                                                {request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {request.status === 'PENDING' ? (
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600">
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Detail
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
