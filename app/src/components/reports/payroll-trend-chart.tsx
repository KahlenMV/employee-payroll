"use client"

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend
} from "recharts"

const data = [
    { name: "Oct", total: 125400, net: 98000 },
    { name: "Nov", total: 128600, net: 101200 },
    { name: "Dec", total: 145000, net: 112000 },
    { name: "Jan", total: 132400, net: 104500 },
    { name: "Feb", total: 142450, net: 114200 },
    { name: "Mar", total: 148500, net: 118400 },
]

export function PayrollTrendChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                />
                <Legend />
                <Bar
                    dataKey="total"
                    name="Gross Payroll"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                />
                <Bar
                    dataKey="net"
                    name="Net Disbursement"
                    fill="hsl(var(--primary) / 0.3)"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
