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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function LeaveRequestDialog() {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setOpen(false)
            toast.success("Leave request submitted for approval!")
        }, 1500)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Request Leave
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-none shadow-xl card-gradient">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl">Request Leave</DialogTitle>
                        <DialogDescription>
                            Submit a time-off request for manager approval.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="leaveType">Leave Type</Label>
                            <Select defaultValue="ANNUAL">
                                <SelectTrigger id="leaveType">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                                    <SelectItem value="SICK">Sick Leave</SelectItem>
                                    <SelectItem value="MATERNITY">Maternity / Paternity</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input id="startDate" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input id="endDate" type="date" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Textarea
                                id="reason"
                                placeholder="Briefly describe the reason for your request..."
                                className="resize-none h-24"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                            ) : (
                                "Submit Request"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
