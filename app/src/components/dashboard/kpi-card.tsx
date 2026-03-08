import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
    title: string
    value: string | number
    description?: string
    icon: LucideIcon
    trend?: {
        value: number
        label: string
    }
}

export function KPICard({ title, value, description, icon: Icon, trend }: KPICardProps) {
    return (
        <Card className="card-gradient group hover:shadow-lg transition-all duration-300 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {title}
                </CardTitle>
                <div className="rounded-xl bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {(description || trend) && (
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        {trend && (
                            <span className={trend.value >= 0 ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
                                {trend.value >= 0 ? "+" : ""}{trend.value}%
                            </span>
                        )}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
