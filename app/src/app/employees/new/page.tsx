"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const formSchema = z.object({
    firstName: z.string().min(2, { message: "First name is required" }),
    lastName: z.string().min(2, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email" }),
    department: z.string().min(1, { message: "Department is required" }),
    position: z.string().min(1, { message: "Position is required" }),
    baseSalary: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid amount" }),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
    startDate: z.string().min(1, { message: "Start date is required" }),
})

export default function NewEmployeePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            department: "Engineering",
            position: "",
            baseSalary: "50000",
            employmentType: "FULL_TIME",
            startDate: new Date().toISOString().split('T')[0],
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        // Simulate server action
        setTimeout(() => {
            console.log(values)
            setIsSubmitting(false)
            toast.success("Employee onboarded successfully!")
            router.push("/employees")
        }, 1500)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href="/employees">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Link>
                </Button>
            </div>

            <div>
                <h2 className="text-3xl font-bold tracking-tight">Onboard New Employee</h2>
                <p className="text-muted-foreground">
                    Fill in the details to create a new employee profile.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none shadow-sm card-gradient">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Basic contact details for the employee.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Work Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="j.doe@company.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm card-gradient">
                            <CardHeader>
                                <CardTitle>Employment & Compensation</CardTitle>
                                <CardDescription>Job role and base salary details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Department</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Engineering">Engineering</SelectItem>
                                                        <SelectItem value="HR">HR</SelectItem>
                                                        <SelectItem value="Finance">Finance</SelectItem>
                                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                                        <SelectItem value="Operations">Operations</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Position</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Software Engineer" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="employmentType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                                                        <SelectItem value="CONTRACT">Contract</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="baseSalary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Annual Salary ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormDescription>Gross amount before taxes/allowances.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="ghost" asChild disabled={isSubmitting}>
                            <Link href="/employees">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Onboard Employee</>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
