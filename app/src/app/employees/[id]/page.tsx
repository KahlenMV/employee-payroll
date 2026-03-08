import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    User,
    Wallet,
    FileText,
    Calendar,
    ShieldCheck,
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    Building2,
    Briefcase,
    Plus
} from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PayslipPreview } from "@/components/payroll/payslip-preview"
import { Separator } from "@/components/ui/separator"

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id)

    let employee: any = null

    try {
        employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                leaveRequests: true,
                bonuses: true,
            }
        })
    } catch (error) {
        console.error("DB Fetch failed, using mock employee", error)
        // Mock fallback for preview
        if (id === 1) {
            employee = {
                id: 1,
                firstName: "Ree",
                lastName: "Talton",
                email: "rtalton0@columbia.edu",
                phone: "160-874-2569",
                address: "Suite 59, 123 Main St",
                department: "Operations",
                position: "Supervisor",
                status: "ON_LEAVE",
                employmentType: "FULL_TIME",
                startDate: new Date("2024-08-18"),
                baseSalary: 78705,
                housingAllowance: 2308.61,
                transportAllowance: 187.1,
                mealSubsidy: 90.29,
                bankName: "St. Francis' Credit Union",
                bankAccountNumber: "****0039",
                taxFilingStatus: "HEAD_OF_HOUSEHOLD",
                taxExemptions: 2,
            }
        }
    }

    if (!employee) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href="/employees">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Employees
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                        {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{employee.firstName} {employee.lastName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {employee.status}
                            </Badge>
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {employee.department}
                            </span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                                <Briefcase className="h-3 w-3" /> {employee.position}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit Profile</Button>
                    <Button>Process Payroll</Button>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="profile" className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <User className="h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="salary" className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Wallet className="h-4 w-4" /> Salary
                    </TabsTrigger>
                    <TabsTrigger value="payslips" className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <FileText className="h-4 w-4" /> Payslips
                    </TabsTrigger>
                    <TabsTrigger value="leave" className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Calendar className="h-4 w-4" /> Leave
                    </TabsTrigger>
                    <TabsTrigger value="benefits" className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <ShieldCheck className="h-4 w-4" /> Benefits
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-none shadow-sm card-gradient">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <span className="text-sm">{employee.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span className="text-sm">{employee.phone || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-balance">{employee.address || "N/A"}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm card-gradient">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Type</span>
                                    <span className="font-medium underline decoration-primary/30">{employee.employmentType}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Started</span>
                                    <span className="font-medium">{new Date(employee.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Tenure</span>
                                    <span className="font-medium">6 months</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm card-gradient">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{employee.emergencyContactName || "N/A"}</span>
                                    <span className="text-xs text-muted-foreground">Primary Contact</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span className="text-sm">{employee.emergencyContactPhone || "N/A"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="salary" className="mt-6 space-y-4">
                    <Card className="border-none shadow-sm card-gradient">
                        <CardHeader>
                            <CardTitle>Current Salary Structure</CardTitle>
                            <CardDescription>Breakdown of monthly base and allowances.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                    <span className="font-medium">Base Salary</span>
                                    <span className="text-xl font-bold">${Number(employee.baseSalary).toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-3 rounded-lg border border-dashed text-center">
                                        <p className="text-xs text-muted-foreground uppercase">Housing</p>
                                        <p className="font-semibold text-primary">${Number(employee.housingAllowance || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-dashed text-center">
                                        <p className="text-xs text-muted-foreground uppercase">Transport</p>
                                        <p className="font-semibold text-primary">${Number(employee.transportAllowance || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-dashed text-center">
                                        <p className="text-xs text-muted-foreground uppercase">Meals</p>
                                        <p className="font-semibold text-primary">${Number(employee.mealSubsidy || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm card-gradient">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Banking & Tax</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground uppercase border-b pb-1">Disbursement</p>
                                <div className="flex justify-between">
                                    <span className="text-sm">Bank</span>
                                    <span className="text-sm font-medium">{employee.bankName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Account</span>
                                    <span className="text-sm font-mono tracking-wider">{employee.bankAccountNumber}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground uppercase border-b pb-1">Tax Configuration</p>
                                <div className="flex justify-between">
                                    <span className="text-sm">Status</span>
                                    <span className="text-sm font-medium">{employee.taxFilingStatus}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Exemptions</span>
                                    <span className="text-sm font-medium">{employee.taxExemptions}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm card-gradient">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Recent Bonuses</CardTitle>
                                <CardDescription>Performance and discretionary awards.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" /> Add Bonus</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { type: 'Performance', amount: 2500, date: '2026-02-15', status: 'PAID' },
                                    { type: 'Quarterly', amount: 1500, date: '2026-01-01', status: 'PAID' }
                                ].map((bonus, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-muted/20 border group hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">B</div>
                                            <div>
                                                <p className="font-bold text-sm">{bonus.type}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(bonus.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-emerald-500">+${bonus.amount.toLocaleString()}</p>
                                            <Badge variant="outline" className="text-[9px] h-4">{bonus.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payslips" className="mt-6 space-y-4">
                    <Card className="border-none shadow-sm card-gradient">
                        <CardHeader>
                            <CardTitle>Historical Payslips</CardTitle>
                            <CardDescription>View and download previous pay period records.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[
                                    { period: 'Feb 2026', date: '2026-02-28', net: 6763.08 },
                                    { period: 'Jan 2026', date: '2026-01-31', net: 6763.08 },
                                    { period: 'Dec 2025', date: '2025-12-31', net: 6540.12 },
                                ].map((pay, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 rounded-xl border group hover:bg-muted/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{pay.period}</p>
                                                <p className="text-xs text-muted-foreground">Issued: {pay.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="font-mono font-bold text-emerald-600">${pay.net.toLocaleString()}</p>
                                            <PayslipPreview employee={employee} record={pay} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leave" className="mt-6 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="border-none shadow-sm bg-primary/5">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                                <Calendar className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">24 Days</div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium">Used (YTD)</CardTitle>
                                <Calendar className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">6 Days</div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                                <Calendar className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold">1</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm card-gradient">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Leave History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { type: 'ANNUAL', dates: 'Jan 05 - Jan 08', days: 4, status: 'APPROVED' },
                                    { type: 'SICK', dates: 'Feb 12', days: 1, status: 'APPROVED' },
                                    { type: 'UNPAID', dates: 'Mar 01 - Mar 02', days: 2, status: 'PENDING' }
                                ].map((leave, i) => (
                                    <div key={i} className="flex justify-between items-center bg-muted/20 p-3 rounded-lg group">
                                        <div>
                                            <p className="font-medium text-sm">{leave.type}</p>
                                            <p className="text-xs text-muted-foreground">{leave.dates} ({leave.days} days)</p>
                                        </div>
                                        <Badge variant={leave.status === 'APPROVED' ? 'default' : 'secondary'}>
                                            {leave.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="benefits" className="mt-6">
                    <Card className="border-none shadow-sm card-gradient">
                        <CardHeader>
                            <CardTitle>Enrolled Benefit Plans</CardTitle>
                            <CardDescription>Employer and employee contribution breakdown.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { plan: 'Platinum Health Plan', type: 'Health', employee: 150, employer: 450 },
                                { plan: 'Dental Plus', type: 'Dental', employee: 25, employer: 50 },
                                { plan: 'Vision Basic', type: 'Vision', employee: 10, employer: 10 }
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border group hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{benefit.plan}</p>
                                            <p className="text-xs text-muted-foreground uppercase">{benefit.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm"><span className="text-muted-foreground">Self:</span> <span className="font-bold">${benefit.employee}</span>/mo</p>
                                        <p className="text-sm font-medium text-emerald-500"><span className="text-muted-foreground">Company:</span> ${benefit.employer}/mo</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
