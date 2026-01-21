"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Car, Users, Wrench, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { generateDocumentHtml } from "@/lib/reportUtils";

export default function ReportsPage() {
    const { vehicles, clients, rentals, maintenances, invoices, companySettings } = useData();



    const handlePrintFleetReport = () => {
        const content = `
            < div class="section-title" > Resumen de Flota</div >
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${vehicles.length}</div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Total Vehículos</div>
                </div>
                <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">${vehicles.filter(v => v.status === 'Disponible').length}</div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Disponibles</div>
                </div>
                <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #d97706;">${vehicles.filter(v => v.status === 'Rentado').length}</div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Rentados</div>
                </div>
                <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${vehicles.filter(v => v.status === 'Mantenimiento').length}</div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">En Mantenimiento</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Vehículo</th>
                        <th>Placa</th>
                        <th>Año</th>
                        <th>Tipo</th>
                        <th>Rango</th>
                        <th>Estado</th>
                        <th class="text-right">Precio Diario</th>
                    </tr>
                </thead>
                <tbody>
                    ${vehicles.map(v => `
                        <tr>
                            <td><strong>${v.name}</strong></td>
                            <td>${v.plate}</td>
                            <td>${v.year}</td>
                            <td>${v.type}</td>
                            <td>${v.range}</td>
                            <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: ${v.status === 'Disponible' ? '#d1fae5; color: #059669;' :
                v.status === 'Rentado' ? '#dbeafe; color: #2563eb;' :
                    '#fee2e2; color: #dc2626;'
            }">${v.status}</span></td>
                            <td class="text-right">${formatCurrency(v.price)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        const html = generateDocumentHtml("Reporte de Flota", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const handlePrintRentalsReport = () => {
        const activeRentals = rentals.filter(r => r.status === 'Activo');
        const completedRentals = rentals.filter(r => r.status === 'Finalizado');

        const content = `
            < div class="section-title" > Resumen de Rentas</div >
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${rentals.length}</div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Total Histórico</div>
                </div>
                <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">${activeRentals.length}</div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Activas Ahora</div>
                </div>
            </div>

            <div class="section-title">Rentas Activas</div>
            ${activeRentals.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Fecha Inicio</th>
                            <th>Días Transcurridos</th>
                            <th class="text-right">Tarifa Diaria</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeRentals.map(r => {
            const client = clients.find(c => c.id === r.clientId);
            const vehicle = vehicles.find(v => v.id === r.vehicleId);
            const days = Math.ceil((new Date().getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24));
            return `
                                <tr>
                                    <td>${client?.name || 'N/A'}</td>
                                    <td>${vehicle?.name || 'N/A'}</td>
                                    <td>${new Date(r.startDate).toLocaleDateString()}</td>
                                    <td>${days} días</td>
                                    <td class="text-right">${formatCurrency(r.dailyRate)}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            ` : '<p style="font-size: 12px; color: #6b7280; font-style: italic;">No hay rentas activas.</p>'
            }

        <div class="section-title">Últimas Rentas Finalizadas</div>
            ${completedRentals.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Periodo</th>
                            <th class="text-right">Total Facturado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${completedRentals.slice(0, 10).map(r => {
                const client = clients.find(c => c.id === r.clientId);
                const vehicle = vehicles.find(v => v.id === r.vehicleId);
                return `
                                <tr>
                                    <td>${client?.name || 'N/A'}</td>
                                    <td>${vehicle?.name || 'N/A'}</td>
                                    <td>${new Date(r.startDate).toLocaleDateString()} - ${r.endDate ? new Date(r.endDate).toLocaleDateString() : 'N/A'}</td>
                                    <td class="text-right">${r.totalAmount ? formatCurrency(r.totalAmount) : '-'}</td>
                                </tr>
                            `;
            }).join('')}
                    </tbody>
                </table>
            ` : '<p style="font-size: 12px; color: #6b7280; font-style: italic;">No hay rentas finalizadas.</p>'
            }
        `;

        const html = generateDocumentHtml("Reporte de Rentas", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const handlePrintMaintenanceReport = () => {
        const totalCost = maintenances.reduce((sum, m) => sum + m.cost, 0);

        const content = `
            < div class="section-title" > Resumen de Mantenimientos</div >
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${formatCurrency(totalCost)}</div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Costo Total Histórico</div>
                </div>
                <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${maintenances.length}</div>
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Total Servicios</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Vehículo</th>
                        <th>Descripción</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th class="text-right">Costo</th>
                    </tr>
                </thead>
                <tbody>
                    ${maintenances.map(m => {
            const vehicle = vehicles.find(v => v.id === m.vehicleId);
            return `
                            <tr>
                                <td><strong>${vehicle?.name || 'N/A'}</strong><br><span style="font-size: 10px; color: #6b7280;">${vehicle?.plate || ''}</span></td>
                                <td>${m.description}</td>
                                <td>${new Date(m.date).toLocaleDateString()}</td>
                                <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: ${m.status === 'Completado' ? '#d1fae5; color: #059669;' :
                    m.status === 'En Proceso' ? '#dbeafe; color: #2563eb;' :
                        '#fef3c7; color: #d97706;'
                }">${m.status}</span></td>
                                <td class="text-right">${formatCurrency(m.cost)}</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;

        const html = generateDocumentHtml("Reporte de Mantenimiento", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const handlePrintClientsReport = () => {
        const content = `
            < div class="section-title" > Listado de Clientes</div >
            <div style="margin-bottom: 20px; font-size: 14px; color: #6b7280;">
                Total de clientes registrados: <strong>${clients.length}</strong>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>DNI/NIF</th>
                        <th>Contacto</th>
                        <th>Dirección</th>
                    </tr>
                </thead>
                <tbody>
                    ${clients.map(c => `
                        <tr>
                            <td><strong>${c.name}</strong></td>
                            <td>${c.dni}</td>
                            <td>${c.email}<br>${c.phone}</td>
                            <td>${c.address}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        const html = generateDocumentHtml("Reporte de Clientes", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const handlePrintFinancialReport = () => {
        const totalIncome = invoices.reduce((sum, i) => sum + i.amount, 0);
        const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);

        const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0);
        const netIncome = totalIncome - totalMaintenanceCost;

        const content = `
            < div class="section-title" > Resumen Financiero</div >
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <div style="font-size: 12px; color: #166534; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Ingresos Totales (Facturado)</div>
                    <div style="font-size: 32px; font-weight: 800; color: #15803d;">${formatCurrency(totalIncome)}</div>
                    <div style="font-size: 12px; color: #166534; margin-top: 5px;">Cobrado: ${formatCurrency(totalPaid)}</div>
                </div>
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca;">
                    <div style="font-size: 12px; color: #991b1b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Gastos (Mantenimiento)</div>
                    <div style="font-size: 32px; font-weight: 800; color: #b91c1c;">${formatCurrency(totalMaintenanceCost)}</div>
                </div>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 30px; text-align: center;">
                <div style="font-size: 12px; color: #1e40af; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Balance Neto Estimado</div>
                <div style="font-size: 42px; font-weight: 800; color: #1d4ed8;">${formatCurrency(netIncome)}</div>
                <div style="font-size: 12px; color: #1e40af;">Ingresos - Gastos de Mantenimiento</div>
            </div>

            <div class="section-title">Últimas Facturas Emitidas</div>
            <table>
                <thead>
                    <tr>
                        <th>Factura #</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th class="text-right">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoices.slice(0, 10).map(i => `
                        <tr>
                            <td>${i.id.slice(0, 8)}</td>
                            <td>${new Date(i.date).toLocaleDateString()}</td>
                            <td>${i.status}</td>
                            <td class="text-right">${formatCurrency(i.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        const html = generateDocumentHtml("Reporte Financiero", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Reportes</h2>
                <p className="text-muted-foreground">Genera reportes detallados del estado de tu negocio.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Fleet Report */}
                <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium text-foreground">Flota de Vehículos</CardTitle>
                        <Car className="h-5 w-5 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Listado completo de vehículos, estado actual, precios y características.
                        </p>
                        <Button onClick={handlePrintFleetReport} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            <FileText className="mr-2 h-4 w-4" /> Generar PDF
                        </Button>
                    </CardContent>
                </Card>

                {/* Rentals Report */}
                <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium text-foreground">Rentas y Actividad</CardTitle>
                        <Calendar className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Historial de rentas, vehículos actualmente rentados y actividad reciente.
                        </p>
                        <Button onClick={handlePrintRentalsReport} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <FileText className="mr-2 h-4 w-4" /> Generar PDF
                        </Button>
                    </CardContent>
                </Card>

                {/* Maintenance Report */}
                <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium text-foreground">Mantenimientos</CardTitle>
                        <Wrench className="h-5 w-5 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Registro de mantenimientos, costos asociados y estado de reparaciones.
                        </p>
                        <Button onClick={handlePrintMaintenanceReport} className="w-full bg-red-600 hover:bg-red-700 text-white">
                            <FileText className="mr-2 h-4 w-4" /> Generar PDF
                        </Button>
                    </CardContent>
                </Card>

                {/* Clients Report */}
                <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium text-foreground">Base de Clientes</CardTitle>
                        <Users className="h-5 w-5 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Directorio de clientes registrados con su información de contacto.
                        </p>
                        <Button onClick={handlePrintClientsReport} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            <FileText className="mr-2 h-4 w-4" /> Generar PDF
                        </Button>
                    </CardContent>
                </Card>

                {/* Financial Report */}
                <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all md:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium text-foreground">Reporte Financiero</CardTitle>
                        <DollarSign className="h-5 w-5 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Resumen de ingresos, gastos y balance general del negocio.
                        </p>
                        <Button onClick={handlePrintFinancialReport} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                            <FileText className="mr-2 h-4 w-4" /> Generar PDF
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
