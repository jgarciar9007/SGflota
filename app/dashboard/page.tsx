"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Car, DollarSign, TrendingUp, Users, Wrench, CheckCircle, Clock, ArrowUpRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
    const { vehicles, clients, rentals, invoices, maintenances, expenses, accountsPayable, driverPayments, payrolls } = useData();

    // --- Financials ---
    const totalIncome = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalGeneralExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalMaintenanceCosts = maintenances.reduce((sum, maint) => sum + maint.cost, 0);
    const totalDriverPayments = driverPayments.reduce((sum, dp) => sum + dp.amount, 0);
    const totalPayroll = payrolls.reduce((sum, p) => sum + p.totalAmount, 0);

    const totalExpenses = totalGeneralExpenses + totalMaintenanceCosts + totalDriverPayments + totalPayroll;
    const totalPayables = accountsPayable.reduce((sum, ap) => (ap.status === "Pendiente" || ap.status === "Retenido") ? sum + ap.amount : sum, 0);
    const utilities = totalIncome - totalExpenses - totalPayables;

    // --- Fleet ---
    const availableVehicles = vehicles.filter(v => v.status === "Disponible").length;
    const rentedVehicles = vehicles.filter(v => v.status === "Rentado").length;
    const vehiclesInMaintenance = vehicles.filter(v => v.status === "Mantenimiento").length;
    const thirdPartyVehicles = vehicles.filter(v => v.ownership === "Tercero").length;

    // --- Operations ---
    const pendingInvoices = invoices.filter(i => i.status === "Pendiente");
    const pendingInvoicesCount = pendingInvoices.length;
    const pendingInvoicesAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);

    const paidInvoices = invoices.filter(i => i.status === "Pagado");
    const paidInvoicesCount = paidInvoices.length;
    const paidInvoicesAmount = paidInvoices.reduce((sum, i) => sum + i.paidAmount, 0);

    const thirdPartyPaymentsMade = accountsPayable.filter(ap => ap.status === "Pagado").length;
    const thirdPartyPaymentsMadeAmount = accountsPayable.filter(ap => ap.status === "Pagado").reduce((sum, ap) => sum + ap.amount, 0);

    // --- Recent Activity ---
    const recentRentals = [...rentals]
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 5);

    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8 p-1">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
                    <p className="text-muted-foreground">Resumen financiero y operativo.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
                        Actualizado: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* Financial Highlights - 3D Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Ingresos Totales"
                    value={formatCurrency(totalIncome)}
                    label="Recaudado"
                    icon={DollarSign}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    ring="ring-emerald-100"
                />
                <StatCard
                    title="Utilidad Neta"
                    value={formatCurrency(utilities)}
                    label="Ingresos - Gastos"
                    icon={TrendingUp}
                    color={utilities >= 0 ? "text-indigo-600" : "text-rose-600"}
                    bg={utilities >= 0 ? "bg-indigo-50" : "bg-rose-50"}
                    ring={utilities >= 0 ? "ring-indigo-100" : "ring-rose-100"}
                />
                <StatCard
                    title="Gastos Totales"
                    value={formatCurrency(totalExpenses)}
                    label="Operativos"
                    icon={TrendingUp}
                    color="text-rose-500"
                    bg="bg-rose-50"
                    ring="ring-rose-100"
                />
                <StatCard
                    title="Cuentas por Pagar"
                    value={formatCurrency(totalPayables)}
                    label="A Terceros"
                    icon={Users}
                    color="text-purple-600"
                    bg="bg-purple-50"
                    ring="ring-purple-100"
                />
            </div>

            {/* Middle Section: Fleet & Operations */}
            <div className="grid gap-6 md:grid-cols-7">
                {/* Fleet Status - Takes 4 columns */}
                <div className="md:col-span-4 grid gap-4 sm:grid-cols-2">
                    <StatusCard title="Disponibles" value={availableVehicles} icon={Car} color="text-emerald-600" bg="bg-emerald-50" />
                    <StatusCard title="Rentados" value={rentedVehicles} icon={Car} color="text-blue-600" bg="bg-blue-50" />
                    <StatusCard title="Mantenimiento" value={vehiclesInMaintenance} icon={Wrench} color="text-amber-500" bg="bg-amber-50" />
                    <StatusCard title="De Terceros" value={thirdPartyVehicles} icon={Users} color="text-purple-600" bg="bg-purple-50" />
                </div>

                {/* Operations Summary - Takes 3 columns */}
                <div className="md:col-span-3 space-y-4">
                    <OpCard
                        title="Facturas Pendientes"
                        value={pendingInvoicesCount}
                        amount={pendingInvoicesAmount}
                        icon={Clock}
                        color="text-amber-600"
                        barColor="bg-amber-500"
                    />
                    <OpCard
                        title="Facturas Pagadas"
                        value={paidInvoicesCount}
                        amount={paidInvoicesAmount}
                        icon={CheckCircle}
                        color="text-emerald-600"
                        barColor="bg-emerald-500"
                    />
                    <OpCard
                        title="Pagos Realizados"
                        value={thirdPartyPaymentsMade}
                        amount={thirdPartyPaymentsMadeAmount}
                        icon={Users}
                        color="text-purple-600"
                        barColor="bg-purple-500"
                    />
                </div>
            </div>

            {/* Recent Activity Sections */}
            <div className="grid gap-8 md:grid-cols-2 mt-8">
                {/* Recent Rentals */}
                <ActivitySection
                    title="Rentas Recientes"
                    link="/rentals"
                    emptyText="No hay rentas recientes"
                    items={recentRentals}
                    type="rentals"
                    context={{ vehicles, clients }}
                />

                {/* Recent Invoices */}
                <ActivitySection
                    title="Facturas Recientes"
                    link="/billing"
                    emptyText="No hay facturas recientes"
                    items={recentInvoices}
                    type="invoices"
                    context={{ vehicles, clients }}
                />
            </div>
        </div>
    );
}

// --- Helper Components ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ title, value, label, icon: Icon, color, bg, ring }: any) {
    return (
        <Card className={cn(
            "border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl bg-card overflow-hidden relative group cursor-default ring-1",
            ring
        )}>
            <div className={cn("absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full opacity-10 transition-transform group-hover:scale-110", color.replace('text-', 'bg-'))} />
            <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-xl shadow-sm", bg)}>
                        <Icon className={cn("h-6 w-6", color)} />
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">{title}</h3>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatusCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 rounded-xl bg-card ring-1 ring-border/50 flex items-center p-4 hover:bg-accent/40 cursor-default">
            <div className={cn("p-3 rounded-lg mr-4", bg)}>
                <Icon className={cn("h-6 w-6", color)} />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </Card>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OpCard({ title, value, amount, icon: Icon, color, barColor }: any) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-card ring-1 ring-border/50 p-4 relative overflow-hidden group">
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", barColor)} />
            <div className="flex items-center justify-between mb-1 pl-2">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <Icon className={cn("h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity", color)} />
            </div>
            <div className="flex items-baseline gap-2 pl-2">
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <p className={cn("text-xs font-medium", color)}>{formatCurrency(amount)}</p>
            </div>
        </Card>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActivitySection({ title, link, emptyText, items, type, context }: any) {
    return (
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden ring-1 ring-border/50 flex flex-col h-full">
            <CardHeader className="bg-muted/30 pb-4 pt-5 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
                    <Link href={link} className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors px-3 py-1 bg-primary/10 rounded-full hover:bg-primary/20">
                        Ver todos <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <div className="divide-y divide-border/50">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {items.length > 0 ? items.map((item: any) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors group">
                            {type === 'rentals' ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs ring-1 ring-blue-100">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {context.vehicles.find((v: any) => v.id === item.vehicleId)?.name.substring(0, 2).toUpperCase() || "VH"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {context.vehicles.find((v: any) => v.id === item.vehicleId)?.name || "N/A"}
                                            </p>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            <p className="text-xs text-muted-foreground">{context.clients.find((c: any) => c.id === item.clientId)?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset",
                                            item.status === "Activo" ? "bg-green-50 text-green-700 ring-green-600/20" :
                                                item.status === "Pendiente" ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20" :
                                                    "bg-gray-50 text-gray-700 ring-gray-600/20"
                                        )}>
                                            {item.status}
                                        </span>
                                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(item.startDate).toLocaleDateString()}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs ring-1 ring-emerald-100">
                                            $
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {context.clients.find((c: any) => c.id === item.clientId)?.name || "Cliente"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">#{item.invoiceNumber || (item.id ? item.id.slice(0, 8) : '---')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-foreground text-sm">{formatCurrency(item.paidAmount)}</p>
                                        <span className={cn(
                                            "text-[10px] font-medium",
                                            item.status === "Pagado" ? "text-emerald-600" : "text-amber-600"
                                        )}>
                                            {item.status}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    )) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <p className="text-sm">{emptyText}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
