import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Download,
    Filter,
    TrendingUp,
    Users,
    Wallet,
    PieChart as PieChartIcon
} from "lucide-react"
import { PayrollTrendChart } from "@/components/reports/payroll-trend-chart"

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Reporting & Analytics</h2>
                    <p className="text-muted-foreground">
                        Visual insights into payroll expenditure and headcount trends.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                    <Button><Download className="mr-2 h-4 w-4" /> Export All</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-none shadow-sm card-gradient">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$5,420</div>
                        <p className="text-xs text-muted-foreground mt-1">+2.4% from last qtr</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm card-gradient">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Retainment Rate</CardTitle>
                        <Users className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94%</div>
                        <p className="text-xs text-muted-foreground mt-1">High compared to industry</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm card-gradient">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tax Liability</CardTitle>
                        <TrendingUp className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$34.2k</div>
                        <p className="text-xs text-muted-foreground mt-1">Projected for March</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm card-gradient">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Headcount</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">148</div>
                        <p className="text-xs text-muted-foreground mt-1">5 new hires this month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm card-gradient">
                    <CardHeader>
                        <CardTitle>Payroll Expenditure Trend</CardTitle>
                        <CardDescription>Comparison of total gross vs net disbursement over 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PayrollTrendChart />
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm card-gradient">
                    <CardHeader>
                        <CardTitle>Departmental Allocation</CardTitle>
                        <CardDescription>Breakdown of total cost by department.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 mt-4">
                            {[
                                { dept: 'Engineering', amount: 82000, percent: 55, color: 'bg-primary' },
                                { dept: 'Marketing', amount: 24000, percent: 16, color: 'bg-orange-500' },
                                { dept: 'Operations', amount: 18000, percent: 12, color: 'bg-emerald-500' },
                                { dept: 'HR & Finance', amount: 24500, percent: 17, color: 'bg-rose-500' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{item.dept}</span>
                                        <span className="text-muted-foreground">${item.amount.toLocaleString()} ({item.percent}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
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
