import * as React from "react"
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
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, UserPlus } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// I'll need the Badge component from shadcn
export function EmployeeTable({ data }: { data: any[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-2 max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search employees..." className="h-9" />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button size="sm" asChild>
                        <Link href="/employees/new">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((employee) => (
                            <TableRow key={employee.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium">#{employee.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                                        <span className="text-xs text-muted-foreground">{employee.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{employee.department}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        employee.status === 'ACTIVE' ? 'default' :
                                            employee.status === 'ON_LEAVE' ? 'secondary' : 'outline'
                                    } className="capitalize">
                                        {employee.status.toLowerCase()}
                                    </Badge>
                                </TableCell>
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
                                                <Link href={`/employees/${employee.id}`}>View Details</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
