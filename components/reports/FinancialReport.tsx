"use client";

import { useData } from "@/context/DataContext";
import { ReportCard } from "./ReportCard";
import { DollarSign, Wallet, CreditCard, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function FinancialReport() {
    const { invoices, maintenances, expenses } = useData();

    // Metrics
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
    const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const pendingCollection = totalInvoiced - totalPaid;

    // Expenses (Maintenance + General Expenses)
    const maintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0);
    const generalExpenses = expenses ? expenses.reduce((sum, e) => sum + e.amount, 0) : 0; // Guard in case expenses not in context yet
    const totalExpenses = maintenanceCost + generalExpenses;

    const netIncome = totalInvoiced - totalExpenses;
    const profitMargin = totalInvoiced > 0 ? ((netIncome / totalInvoiced) * 100).toFixed(1) : "0";

    // Chart Data: Monthly Income vs Expenses
    // Grouping invoices and expenses by month (last 6 months)
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

        const monthlyMaintenance = maintenances
            .filter(m => {
                const d = new Date(m.date);
                return d.getMonth() === month && d.getFullYear() === year;
            })
            .reduce((sum, m) => sum + m.cost, 0);

        const monthlyGeneralExpenses = expenses
            ? expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === month && d.getFullYear() === year;
            }).reduce((sum, e) => sum + e.amount, 0)
            : 0;

        return {
            name: monthName,
            Ingresos: monthlyIncome,
            Gastos: monthlyMaintenance + monthlyGeneralExpenses
        };
    });

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ReportCard
                    title="Ingresos Netos (Est.)"
                    value={formatCurrency(netIncome)}
                    icon={TrendingUp}
                    description={`Margen: ${profitMargin}%`}
                    iconColor="text-green-600"
                />
                <ReportCard
                    title="Total Facturado"
                    value={formatCurrency(totalInvoiced)}
                    icon={DollarSign}
                    iconColor="text-blue-600"
                />
                <ReportCard
                    title="Gastos Totales"
                    value={formatCurrency(totalExpenses)}
                    icon={Wallet}
                    description="Mantenimiento + Gastos Gral."
                    iconColor="text-red-600"
                />
                <ReportCard
                    title="Pendiente de Cobro"
                    value={formatCurrency(pendingCollection)}
                    icon={CreditCard}
                    iconColor="text-orange-600"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Comparativa Ingresos vs Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="Ingresos" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
