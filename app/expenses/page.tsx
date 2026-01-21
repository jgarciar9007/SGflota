"use client";

import { useState } from "react";
import MaintenanceTab from "@/components/expenses/MaintenanceTab";
import GeneralExpensesTab from "@/components/expenses/GeneralExpensesTab";
import { Wrench, TrendingUp, Wallet, FileText, User, Users } from "lucide-react";
import DriverPaymentsTab from "@/components/expenses/DriverPaymentsTab";
import PayrollTab from "@/components/expenses/PayrollTab";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

export default function ExpensesPage() {
    const { expenses, maintenances } = useData();
    const [activeTab, setActiveTab] = useState<"general" | "maintenance" | "drivers" | "payroll">("general");

    const totalGeneralExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalMaintenanceCosts = maintenances.reduce((sum, maint) => sum + maint.cost, 0);
    const totalExpenses = totalGeneralExpenses + totalMaintenanceCosts;

    return (
        <div className="space-y-8 w-full p-1">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Gastos y Mantenimiento</h2>
                    <p className="text-muted-foreground">Gestiona los gastos operativos y el mantenimiento de la flota.</p>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Totales (Global)</CardTitle>
                        <TrendingUp className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{formatCurrency(totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Suma de operativos y mantenimiento</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Operativos</CardTitle>
                        <Wallet className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{formatCurrency(totalGeneralExpenses)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{expenses.length} registros</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Costo de Mantenimiento</CardTitle>
                        <Wrench className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{formatCurrency(totalMaintenanceCosts)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{maintenances.length} registros</p>
                    </CardContent>
                </Card>
            </div>

            {/* Modern Tab Navigation */}
            <div className="flex gap-6 border-b border-border pb-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`pb-3 px-2 text-sm font-medium transition-all relative ${activeTab === "general"
                        ? "text-blue-600"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <FileText className="h-4 w-4" />
                        Gastos Generales
                    </div>
                    {activeTab === "general" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("maintenance")}
                    className={`pb-3 px-2 text-sm font-medium transition-all relative ${activeTab === "maintenance"
                        ? "text-orange-600"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <Wrench className="h-4 w-4" />
                        Mantenimiento
                    </div>
                    {activeTab === "maintenance" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("drivers")}
                    className={`pb-3 px-2 text-sm font-medium transition-all relative ${activeTab === "drivers"
                        ? "text-orange-500"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <User className="h-4 w-4" />
                        Pagos Conductores
                    </div>
                    {activeTab === "drivers" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("payroll")}
                    className={`pb-3 px-2 text-sm font-medium transition-all relative ${activeTab === "payroll"
                        ? "text-green-600"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <Users className="h-4 w-4" />
                        Nómina
                    </div>
                    {activeTab === "payroll" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "general" && <GeneralExpensesTab />}
                {activeTab === "maintenance" && <MaintenanceTab />}
                {activeTab === "drivers" && <DriverPaymentsTab />}
                {activeTab === "payroll" && <PayrollTab />}
            </div>
        </div>
    );
}
