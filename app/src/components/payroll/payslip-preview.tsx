import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Printer, Download } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function PayslipPreview({ employee, record }: { employee: any, record: any }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 py-0">
                    <FileText className="mr-2 h-4 w-4" /> View Payslip
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl overflow-hidden p-0">
                <div className="bg-primary p-6 text-primary-foreground">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold uppercase tracking-widest">Payslip</h2>
                            <p className="text-sm opacity-80">Period: March 01 - March 31, 2026</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold">Antigravity Corp</h3>
                            <p className="text-xs opacity-80 underline">123 Tech Lane, Silicon Valley</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6 bg-background">
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div className="space-y-1">
                            <p className="text-muted-foreground uppercase font-bold text-[10px]">Employee Details</p>
                            <p className="font-bold">{employee.firstName} {employee.lastName}</p>
                            <p className="text-xs">{employee.position}</p>
                            <p className="text-xs">{employee.department} Dept.</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-muted-foreground uppercase font-bold text-[10px]">Payment Method</p>
                            <p className="font-bold">{employee.bankName}</p>
                            <p className="text-xs font-mono">****0039</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-3">
                            <p className="text-primary font-bold text-xs uppercase">Earnings</p>
                            <div className="flex justify-between text-sm">
                                <span>Base Salary</span>
                                <span className="font-mono">$6,558.75</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Housing Allowance</span>
                                <span className="font-mono">$2,308.61</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Transport Allowance</span>
                                <span className="font-mono">$187.10</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t pt-2">
                                <span>Gross Pay</span>
                                <span className="font-mono">$9,054.46</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-rose-500 font-bold text-xs uppercase">Deductions</p>
                            <div className="flex justify-between text-sm">
                                <span>Income Tax (PAYE)</span>
                                <span className="font-mono text-rose-500">-$1,448.71</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>FICA (SS+Med)</span>
                                <span className="font-mono text-rose-500">-$692.67</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Health Insurance</span>
                                <span className="font-mono">-$150.00</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t pt-2">
                                <span>Total Ded.</span>
                                <span className="font-mono text-rose-500">-$2,291.38</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center border border-dashed">
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Net Disbursement</p>
                            <p className="text-3xl font-bold tracking-tighter text-emerald-600 font-mono">$6,763.08</p>
                        </div>
                        <div className="text-right italic text-xs text-muted-foreground max-w-[200px]">
                            "This is a system-generated document. No signature required."
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4" /> Print</Button>
                        <Button size="sm"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
