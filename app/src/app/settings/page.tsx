import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
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
import {
    Plus,
    Receipt,
    ShieldCheck,
    Building2,
    Trash2,
    Edit
} from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient">System Settings</h2>
                <p className="text-muted-foreground">
                    Configure payroll rules, tax brackets, and benefit plan structures.
                </p>
            </div>

            <Tabs defaultValue="tax" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl max-w-md">
                    <TabsTrigger value="tax" className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Receipt className="h-4 w-4" /> Tax Brackets
                    </TabsTrigger>
                    <TabsTrigger value="benefits" className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <ShieldCheck className="h-4 w-4" /> Benefit Plans
                    </TabsTrigger>
                    <TabsTrigger value="org" className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Building2 className="h-4 w-4" /> Organization
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tax" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Income Tax Brackets (2026)</h3>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Bracket</Button>
                    </div>
                    <Card className="border-none shadow-sm card-gradient">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Filing Status</TableHead>
                                        <TableHead>Min Amount</TableHead>
                                        <TableHead>Max Amount</TableHead>
                                        <TableHead>Rate (%)</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { status: 'SINGLE', min: 0, max: 11600, rate: 10 },
                                        { status: 'SINGLE', min: 11601, max: 47150, rate: 12 },
                                        { status: 'JOINT', min: 0, max: 23200, rate: 10 },
                                        { status: 'JOINT', min: 23201, max: 94300, rate: 12 },
                                    ].map((bracket, i) => (
                                        <TableRow key={i} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell><Badge variant="outline">{bracket.status}</Badge></TableCell>
                                            <TableCell className="font-mono">${bracket.min.toLocaleString()}</TableCell>
                                            <TableCell className="font-mono">${bracket.max.toLocaleString()}</TableCell>
                                            <TableCell className="font-bold text-primary">{bracket.rate}%</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="benefits" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Standard Benefit Plans</h3>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Create Plan</Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { name: 'Platinum Health', type: 'Medical', cost: 600, share: 75 },
                            { name: '401k Match', type: 'Retirement', cost: 0, share: 100 },
                            { name: 'Life Premium', type: 'Insurance', cost: 45, share: 100 },
                        ].map((plan, i) => (
                            <Card key={i} className="border-none shadow-sm card-gradient group">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-md">{plan.name}</CardTitle>
                                        <CardDescription>{plan.type}</CardDescription>
                                    </div>
                                    <Badge className="bg-emerald-500">{plan.share}% Employer</Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-medium">Total Monthly: <span className="text-primary font-bold">${plan.cost}</span></p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="org" className="mt-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm card-gradient">
                            <CardHeader>
                                <CardTitle>Departments</CardTitle>
                                <CardDescription>Define organizational units for reporting.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {['Engineering', 'Product', 'Marketing', 'Sales', 'Operations', 'Finance', 'Legal'].map((d) => (
                                    <div key={d} className="flex justify-between items-center p-2 rounded-lg bg-muted/20 text-sm">
                                        <span>{d}</span>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" className="w-full mt-2 border-dashed">
                                    <Plus className="mr-2 h-4 w-4" /> Add Department
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm card-gradient">
                            <CardHeader>
                                <CardTitle>Security Roles (RBAC)</CardTitle>
                                <CardDescription>Configure system access permissions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { role: 'SUPER_ADMIN', desc: 'Full system access', color: 'bg-rose-500' },
                                    { role: 'HR_ADMIN', desc: 'Employee and Leave management', color: 'bg-primary' },
                                    { role: 'FINANCE_OFFICER', desc: 'Payroll processing and reporting', color: 'bg-emerald-500' },
                                    { role: 'EMPLOYEE', desc: 'Self-service (Payslips, Leave)', color: 'bg-muted-foreground' },
                                ].map((r) => (
                                    <div key={r.role} className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${r.color}`} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{r.role}</span>
                                            <span className="text-xs text-muted-foreground">{r.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
