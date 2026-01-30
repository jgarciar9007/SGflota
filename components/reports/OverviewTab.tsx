"use client";

import { useData } from "@/context/DataContext";
import { ReportCard } from "./ReportCard";
import { DollarSign, Activity, Wrench, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function OverviewTab() {
    const { invoices, rentals, maintenances, vehicles, clients } = useData();

    // Calculate totals
    const totalIncome = invoices.reduce((sum, i) => sum + i.amount, 0);
    const activeRentals = rentals.filter(r => r.status === 'Activo').length;
    const maintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0);

    // Prepare data for "Income vs Time" (Simulated monthly aggregation for now, or based on invoice date)
    // We'll group last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d;
    }).reverse();

    const chartData = last6Months.map(date => {
        const monthName = date.toLocaleString('default', { month: 'short' });
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthlyIncome = invoices
            .filter(i => {
                const d = new Date(i.date);
                return d.getMonth() === month && d.getFullYear() === year;
            })
            .reduce((sum, i) => sum + i.amount, 0);

        return { name: monthName, income: monthlyIncome };
    });

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ReportCard
                    title="Ingresos Totales"
                    value={formatCurrency(totalIncome)}
                    icon={DollarSign}
                    description="Facturado históricamente"
                    iconColor="text-green-600"
                />
                <ReportCard
                    title="Rentas Activas"
                    value={activeRentals}
                    icon={Activity}
                    description="Vehículos en calle"
                    iconColor="text-blue-600"
                />
                <ReportCard
                    title="Gastos Mantenimiento"
                    value={formatCurrency(maintenanceCost)}
                    icon={Wrench}
                    description="Costo total reparaciones"
                    iconColor="text-red-600"
                />
                <ReportCard
                    title="Total Clientes"
                    value={clients.length}
                    icon={Users}
                    description="Registrados en sistema"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Income Chart */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Tendencia de Ingresos</h3>
                    <p className="text-sm text-muted-foreground">Facturación de los últimos 6 meses</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Area type="monotone" dataKey="income" stroke="#2563eb" fillOpacity={1} fill="url(#colorIncome)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
