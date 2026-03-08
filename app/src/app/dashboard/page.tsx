import { CreditCard, Users, Clock, TrendingUp } from "lucide-react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
    // Mock data for initial view (will be replaced by Prisma fetches)
    const stats = [
        {
            title: "Total Payroll (MTD)",
            value: "$142,450.00",
            description: "from last month",
            icon: CreditCard,
            trend: { value: 12, label: "up" }
        },
        {
            title: "Active Employees",
            value: "148",
            description: "new joins this month",
            icon: Users,
            trend: { value: 4, label: "up" }
        },
        {
            title: "Pending Approvals",
            value: "12",
            description: "leave & bonus requests",
            icon: Clock,
        },
        {
            title: "Net Payroll Cost (YTD)",
            value: "$1.2M",
            description: "on track with budget",
            icon: TrendingUp,
            trend: { value: -2, label: "down" }
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Overview of your organization's payroll and employee metrics.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button>Download Report</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <KPICard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm card-gradient">
                    <CardHeader>
                        <CardTitle>Payroll Trends</CardTitle>
                        <CardDescription>
                            Monthly payroll expenditure for the current fiscal year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground italic bg-muted/20 rounded-lg border-2 border-dashed">
                            Monthly Trend Chart Component (Recharts)
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm card-gradient">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest payroll events and approvals.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[
                                { name: "John Doe", action: "Leave Approved", time: "2 hours ago", amount: null },
                                { name: "Sarah Smith", action: "Bonus Paid", time: "5 hours ago", amount: "$500" },
                                { name: "Finance Dept", action: "Payroll Committed", time: "Yesterday", amount: "$142k" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.action}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {item.amount && <span>{item.amount}</span>}
                                        <p className="text-xs text-muted-foreground text-right">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
