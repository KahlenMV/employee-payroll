"use client"

import * as React from "react"
import {
    BarChart3,
    Calendar,
    CreditCard,
    LayoutDashboard,
    Settings,
    Users,
    Wallet,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Employees",
        url: "/employees",
        icon: Users,
    },
    {
        title: "Payroll",
        url: "/payroll",
        icon: Wallet,
    },
    {
        title: "Leave",
        url: "/leave",
        icon: Calendar,
    },
    {
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b px-6 py-4">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <span className="truncate group-data-[collapsible=icon]:hidden italic">
                        PayrollPro
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                {/* User profile could go here */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
