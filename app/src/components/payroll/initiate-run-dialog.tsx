"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PlayCircle, Loader2 } from "lucide-react"

export function InitiateRunDialog() {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const handleInitiate = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setOpen(false)
        }, 2000)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Initiate New Run
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-none shadow-xl card-gradient">
                <DialogHeader>
                    <DialogTitle className="text-xl">Initiate Payroll Run</DialogTitle>
                    <DialogDescription>
                        Select the period and departments to process.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="month">Month</Label>
                            <Select defaultValue="03">
                                <SelectTrigger id="month">
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="01">January</SelectItem>
                                    <SelectItem value="02">February</SelectItem>
                                    <SelectItem value="03">March</SelectItem>
                                    <SelectItem value="04">April</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Select defaultValue="2026">
                                <SelectTrigger id="year">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                    <SelectItem value="2027">2027</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Departments</Label>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-xl border border-dashed">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="dept-all" defaultChecked />
                                <Label htmlFor="dept-all" className="text-xs">All Departments</Label>
                            </div>
                            <div className="flex items-center space-x-2 opacity-50">
                                <Checkbox id="dept-eng" disabled />
                                <Label htmlFor="dept-eng" className="text-xs">Engineering</Label>
                            </div>
                            <div className="flex items-center space-x-2 opacity-50">
                                <Checkbox id="dept-hr" disabled />
                                <Label htmlFor="dept-hr" className="text-xs">HR</Label>
                            </div>
                            <div className="flex items-center space-x-2 opacity-50">
                                <Checkbox id="dept-fin" disabled />
                                <Label htmlFor="dept-fin" className="text-xs">Finance</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground italic flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            Processing for 148 active employees.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleInitiate}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                        ) : (
                            "Generate Draft Run"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
