"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Battery, Fuel, Gauge, Calendar, DollarSign, Wrench, Car, Activity, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { generateDocumentHtml } from "@/lib/reportUtils";

export default function VehicleDetailsPage() {
    const params = useParams();
    const { vehicles, rentals, maintenances, companySettings } = useData();

    // Ensure params.id is a string
    const vehicleId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const vehicleRentals = rentals.filter((r) => r.vehicleId === vehicleId);
    const vehicleMaintenances = maintenances.filter((m) => m.vehicleId === vehicleId);

    if (!vehicle) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Vehículo no encontrado</h2>
                <Link href="/fleet">
                    <Button variant="outline" className="text-white border-gray-600">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Flota
                    </Button>
                </Link>
            </div>
        );
    }

    // Calculate stats
    const totalRevenue = vehicleRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const totalMaintenanceCost = vehicleMaintenances.reduce((sum, m) => sum + m.cost, 0);
    const activeRental = vehicleRentals.find(r => r.status === 'Activo');

    const handlePrintVehicleSheet = () => {


        const content = `
            <div class="section-title">Ficha Técnica del Vehículo</div>
            
            <div style="display: flex; gap: 40px; margin-bottom: 30px;">
                <div style="flex: 1;">
                    <img src="${vehicle.image}" style="width: 100%; border-radius: 8px; object-fit: cover; height: 300px;" />
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 28px; font-weight: 800; color: #1f2937; margin-bottom: 10px;">${vehicle.name}</div>
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">${vehicle.year} • ${vehicle.type}</div>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Placa</div>
                                <div style="font-size: 16px; font-weight: 600;">${vehicle.plate}</div>
                            </div>
                            <div>
                                <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Rango</div>
                                <div style="font-size: 16px; font-weight: 600;">${vehicle.range}</div>
                            </div>
                            <div>
                                <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Precio Diario</div>
                                <div style="font-size: 16px; font-weight: 600; color: #059669;">${formatCurrency(vehicle.price)}</div>
                            </div>
                            <div>
                                <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Estado</div>
                                <div style="font-size: 16px; font-weight: 600;">${vehicle.status}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-title">Historial de Actividad</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #374151;">Últimas Rentas</div>
                    ${vehicleRentals.length > 0 ? `
                        <table>
                            <thead><tr><th>Fecha</th><th>Estado</th><th class="text-right">Total</th></tr></thead>
                            <tbody>
                                ${vehicleRentals.slice(0, 5).map(r => `
                                    <tr>
                                        <td>${new Date(r.startDate).toLocaleDateString()}</td>
                                        <td>${r.status}</td>
                                        <td class="text-right">${formatCurrency(r.totalAmount || 0)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="font-size: 12px; color: #6b7280;">Sin historial de rentas.</p>'}
                </div>
                <div>
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #374151;">Últimos Mantenimientos</div>
                    ${vehicleMaintenances.length > 0 ? `
                        <table>
                            <thead><tr><th>Fecha</th><th>Descripción</th><th class="text-right">Costo</th></tr></thead>
                            <tbody>
                                ${vehicleMaintenances.slice(0, 5).map(m => `
                                    <tr>
                                        <td>${new Date(m.date).toLocaleDateString()}</td>
                                        <td>${m.description}</td>
                                        <td class="text-right">${formatCurrency(m.cost)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="font-size: 12px; color: #6b7280;">Sin historial de mantenimiento.</p>'}
                </div>
            </div>
        `;

        const html = generateDocumentHtml(`Ficha: ${vehicle.name}`, companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/fleet">
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">{vehicle.name}</h2>
                    <p className="text-gray-300">Detalles y estadísticas del vehículo</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button onClick={handlePrintVehicleSheet} variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                        <FileText className="mr-2 h-4 w-4" /> Imprimir Ficha
                    </Button>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 flex items-center ${vehicle.status === 'Disponible' ? 'bg-green-600 text-white border-green-500' :
                        vehicle.status === 'Rentado' ? 'bg-blue-600 text-white border-blue-500' :
                            'bg-yellow-600 text-white border-yellow-500'
                        }`}>
                        {vehicle.status}
                    </span>
                </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Image & Specs */}
                <Card className="border-gray-700 bg-gray-800/50 backdrop-blur md:col-span-1 overflow-hidden">
                    <div className="aspect-video w-full relative">
                        <Image
                            src={vehicle.image}
                            alt={vehicle.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                        <div className="absolute bottom-4 left-4">
                            <p className="text-2xl font-bold text-white">{formatCurrency(vehicle.price)}/día</p>
                        </div>
                    </div>
                    <CardContent className="space-y-4 p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-gray-300">
                                <Car className="h-4 w-4 text-blue-400" />
                                <span>{vehicle.plate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Calendar className="h-4 w-4 text-purple-400" />
                                <span>{vehicle.year}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                {vehicle.type === 'Eléctrico' ? <Battery className="h-4 w-4 text-green-400" /> : <Fuel className="h-4 w-4 text-orange-400" />}
                                <span>{vehicle.type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Gauge className="h-4 w-4 text-red-400" />
                                <span>{vehicle.range}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="md:col-span-2 grid gap-6 md:grid-cols-3">
                    <Card className="border-gray-700 bg-gradient-to-br from-green-900/20 to-gray-900">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <DollarSign className="h-8 w-8 text-green-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
                            <p className="text-xs text-gray-400">Ingresos Totales</p>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-700 bg-gradient-to-br from-blue-900/20 to-gray-900">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <Activity className="h-8 w-8 text-blue-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{vehicleRentals.length}</div>
                            <p className="text-xs text-gray-400">Rentas Totales</p>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-700 bg-gradient-to-br from-red-900/20 to-gray-900">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <Wrench className="h-8 w-8 text-red-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{formatCurrency(totalMaintenanceCost)}</div>
                            <p className="text-xs text-gray-400">Costo Mantenimiento</p>
                        </CardContent>
                    </Card>

                    {/* Active Rental Info (if any) */}
                    {activeRental && (
                        <Card className="border-blue-500 bg-blue-900/10 md:col-span-3">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-blue-400 flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Renta Activa
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-bold">Desde: {new Date(activeRental.startDate).toLocaleDateString()}</p>
                                        <p className="text-sm text-gray-400">Cliente ID: {activeRental.clientId}</p>
                                    </div>
                                    <Link href="/rentals">
                                        <Button size="sm" variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-900/50">
                                            Ver en Rentas
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* History Sections */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Rental History */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Car className="h-5 w-5 text-blue-400" />
                        Historial de Rentas
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {vehicleRentals.length > 0 ? (
                            vehicleRentals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((rental) => (
                                <Card key={rental.id} className="border-gray-700 bg-gray-800/30">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-medium">{new Date(rental.startDate).toLocaleDateString()} - {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'En curso'}</p>
                                                <p className="text-xs text-gray-400">Cliente: {rental.clientId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{formatCurrency(rental.totalAmount || 0)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${rental.status === 'Activo' ? 'text-green-400 border-green-800 bg-green-900/20' : 'text-gray-400 border-gray-700'
                                                    }`}>
                                                    {rental.status}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4 bg-gray-800/20 rounded-lg border border-gray-800">No hay rentas registradas</p>
                        )}
                    </div>
                </div>

                {/* Maintenance History */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-red-400" />
                        Historial de Mantenimiento
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {vehicleMaintenances.length > 0 ? (
                            vehicleMaintenances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((maint) => (
                                <Card key={maint.id} className="border-gray-700 bg-gray-800/30">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-medium">{maint.description}</p>
                                                <p className="text-xs text-gray-400">{new Date(maint.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-red-400">-{formatCurrency(maint.cost)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${maint.status === 'Completado' ? 'text-green-400 border-green-800 bg-green-900/20' :
                                                    maint.status === 'En Proceso' ? 'text-blue-400 border-blue-800 bg-blue-900/20' :
                                                        'text-yellow-400 border-yellow-800 bg-yellow-900/20'
                                                    }`}>
                                                    {maint.status}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4 bg-gray-800/20 rounded-lg border border-gray-800">No hay mantenimientos registrados</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
