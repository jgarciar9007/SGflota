"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Car, DollarSign, TrendingUp, Users, Calendar, Wrench, CheckCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
    const { vehicles, clients, rentals, invoices, maintenances } = useData();

    // Calcular estadísticas
    const activeRentals = rentals.filter(r => r.status === "Activo").length;
    const availableVehicles = vehicles.filter(v => v.status === "Disponible").length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingRevenue = invoices.filter(inv => inv.status === "Pendiente").reduce((sum, inv) => sum + inv.amount, 0);
    const paidRevenue = invoices.filter(inv => inv.status === "Pagado").reduce((sum, inv) => sum + inv.amount, 0);
    const vehiclesInMaintenance = vehicles.filter(v => v.status === "Mantenimiento").length;
    const rentedVehicles = vehicles.filter(v => v.status === "Rentado").length;

    // Rentas recientes (últimas 5)
    const recentRentals = rentals
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
                    <p className="text-gray-300">Resumen general del sistema</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                        Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* Estadísticas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-700 bg-gradient-to-br from-green-900/20 to-gray-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Ingresos Totales
                        </CardTitle>
                        <DollarSign className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            <span className="text-green-400">{formatCurrency(paidRevenue)} pagado</span> •
                            <span className="text-yellow-400"> {formatCurrency(pendingRevenue)} pendiente</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gradient-to-br from-blue-900/20 to-gray-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Rentas Activas
                        </CardTitle>
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{activeRentals}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            {rentals.length} rentas totales
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gradient-to-br from-purple-900/20 to-gray-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Vehículos
                        </CardTitle>
                        <Car className="h-5 w-5 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{vehicles.length}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            <span className="text-green-400">{availableVehicles} disponibles</span> •
                            <span className="text-blue-400"> {rentedVehicles} rentados</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gradient-to-br from-orange-900/20 to-gray-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Clientes
                        </CardTitle>
                        <Users className="h-5 w-5 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{clients.length}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            Clientes registrados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Estadísticas secundarias */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-gray-700 bg-gray-800/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Facturas Pendientes
                        </CardTitle>
                        <Clock className="h-5 w-5 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {invoices.filter(i => i.status === "Pendiente").length}
                        </div>
                        <p className="text-xs text-yellow-400 mt-1">{formatCurrency(pendingRevenue)} por cobrar</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gray-800/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            Facturas Pagadas
                        </CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {invoices.filter(i => i.status === "Pagado").length}
                        </div>
                        <p className="text-xs text-green-400 mt-1">{formatCurrency(paidRevenue)} cobrado</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gray-800/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">
                            En Mantenimiento
                        </CardTitle>
                        <Wrench className="h-5 w-5 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{vehiclesInMaintenance}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            {maintenances.filter(m => m.status !== "Completado").length} programados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Rentas recientes y estado de flota */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-gray-700 bg-gray-800/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-400" />
                            Rentas Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentRentals.length > 0 ? (
                            <div className="space-y-4">
                                {recentRentals.map((rental) => {
                                    const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                                    const client = clients.find(c => c.id === rental.clientId);
                                    return (
                                        <div key={rental.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${rental.status === "Activo"
                                                    ? "bg-green-600/20 border-green-500"
                                                    : "bg-gray-600/20 border-gray-500"
                                                    }`}>
                                                    <Car className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{client?.name}</p>
                                                    <p className="text-xs text-gray-400">{vehicle?.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{formatCurrency(rental.dailyRate)}/día</p>
                                                <p className={`text-xs ${rental.status === "Activo" ? "text-green-400" : "text-gray-400"}`}>
                                                    {rental.status}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">No hay rentas registradas</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gray-800/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Car className="h-5 w-5 text-purple-400" />
                            Estado de la Flota
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-gray-300">Disponibles</span>
                                </div>
                                <span className="text-lg font-bold text-white">{availableVehicles}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm text-gray-300">Rentados</span>
                                </div>
                                <span className="text-lg font-bold text-white">{rentedVehicles}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm text-gray-300">En Mantenimiento</span>
                                </div>
                                <span className="text-lg font-bold text-white">{vehiclesInMaintenance}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-300">Total de Vehículos</span>
                                    <span className="text-2xl font-bold text-white">{vehicles.length}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
