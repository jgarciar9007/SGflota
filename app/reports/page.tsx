"use client";

import { useData } from "@/context/DataContext";
import React from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { generateDocumentHtml } from "@/lib/reportUtils";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Car,
    Calendar,
    History,
    Wrench,
    Users,
    Wallet,
    Banknote,
    FileText,
    AlertCircle,
    UserCheck
} from "lucide-react";

export default function ReportsPage() {
    const {
        vehicles,
        clients,
        rentals,
        maintenances,
        invoices,
        expenses,
        payrolls,
        driverPayments,
        companySettings,
        personnel
    } = useData();

    const [dateRange, setDateRange] = React.useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const filterByDate = (dateString: string | Date) => {
        if (!dateString) return false;
        const d = new Date(dateString).getTime();
        const start = new Date(dateRange.start).getTime();
        const end = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000) - 1; // Include full end day
        return d >= start && d <= end;
    };

    const getDateRangeLabel = () => {
        return `Del ${new Date(dateRange.start).toLocaleDateString()} al ${new Date(dateRange.end).toLocaleDateString()}`;
    };

    // --- Helper Styles for PDF ---
    const tableStyle = `
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        font-size: 12px;
    `;
    const thStyle = `
        background-color: #f3f4f6;
        padding: 8px;
        text-align: left;
        border-bottom: 2px solid #e5e7eb;
        font-weight: bold;
        color: #374151;
    `;
    const tdStyle = `
        padding: 8px;
        border-bottom: 1px solid #e5e7eb;
        color: #4b5563;
    `;
    const sectionTitleStyle = `
        font-size: 16px;
        font-weight: bold;
        color: #111827;
        margin-top: 25px;
        margin-bottom: 10px;
        border-left: 4px solid #f97316;
        padding-left: 10px;
    `;

    const printReport = (title: string, content: string) => {
        const fullContent = `
            <div style="margin-bottom: 20px; text-align: right; font-size: 12px; color: #6b7280;">
                Periodo: <strong>${getDateRangeLabel()}</strong>
            </div>
            ${content}
        `;
        const html = generateDocumentHtml(title, companySettings, fullContent);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    // ==========================================
    // 1. FINANCIAL REPORTS
    // ==========================================

    const handleIncomeStatement = () => {
        // Filter Data
        const filteredInvoices = invoices.filter(i => filterByDate(i.date));
        const filteredMaintenances = maintenances.filter(m => filterByDate(m.date));
        const filteredExpenses = expenses.filter(e => filterByDate(e.date));
        const filteredPayrolls = payrolls.filter(p => {
            const pDate = new Date(p.year, p.month - 1, 1);
            return filterByDate(pDate);
        });
        const filteredDriverPayments = driverPayments.filter(p => filterByDate(p.date));

        // Income
        const totalInvoiced = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
        const totalCollected = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);

        // Expenses
        const maintenanceCost = filteredMaintenances.reduce((sum, m) => sum + m.cost, 0);
        const generalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const payrollCost = filteredPayrolls.reduce((sum, p) => sum + p.totalAmount, 0);
        const driverPaymentsCost = filteredDriverPayments.reduce((sum, p) => sum + p.amount, 0);

        const totalExpenses = maintenanceCost + generalExpenses + payrollCost + driverPaymentsCost;
        const netProfit = totalInvoiced - totalExpenses;
        const cashFlow = totalCollected - totalExpenses;

        const content = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 24px; font-weight: bold; color: #111827;">Estado de Resultados</div>
                <div style="color: #6b7280;">Resumen Financiero Global</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="padding: 15px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
                    <div style="font-weight: bold; color: #047857;">Total Facturado (Ingresos)</div>
                    <div style="font-size: 20px; font-weight: bold;">${formatCurrency(totalInvoiced)}</div>
                    <div style="font-size: 11px; color: #047857; margin-top: 4px;">Cobrado Real: ${formatCurrency(totalCollected)}</div>
                </div>
                <div style="padding: 15px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
                    <div style="font-weight: bold; color: #b91c1c;">Total Gastos Operativos</div>
                    <div style="font-size: 20px; font-weight: bold;">${formatCurrency(totalExpenses)}</div>
                </div>
            </div>

            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Categoría</th>
                        <th style="${thStyle} text-align: right;">Monto</th>
                        <th style="${thStyle} text-align: right;">% del Gasto</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="${tdStyle}">Mantenimiento de Flota</td>
                        <td style="${tdStyle} text-align: right;">${formatCurrency(maintenanceCost)}</td>
                        <td style="${tdStyle} text-align: right;">${totalExpenses > 0 ? ((maintenanceCost / totalExpenses) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                        <td style="${tdStyle}">Gastos Generales</td>
                        <td style="${tdStyle} text-align: right;">${formatCurrency(generalExpenses)}</td>
                        <td style="${tdStyle} text-align: right;">${totalExpenses > 0 ? ((generalExpenses / totalExpenses) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                        <td style="${tdStyle}">Nómina (Staff)</td>
                        <td style="${tdStyle} text-align: right;">${formatCurrency(payrollCost)}</td>
                        <td style="${tdStyle} text-align: right;">${totalExpenses > 0 ? ((payrollCost / totalExpenses) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                        <td style="${tdStyle}">Pagos a Conductores</td>
                        <td style="${tdStyle} text-align: right;">${formatCurrency(driverPaymentsCost)}</td>
                        <td style="${tdStyle} text-align: right;">${totalExpenses > 0 ? ((driverPaymentsCost / totalExpenses) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr style="background-color: #f9fafb; font-weight: bold;">
                        <td style="${tdStyle} border-top: 2px solid #e5e7eb;">TOTAL GASTOS</td>
                        <td style="${tdStyle} border-top: 2px solid #e5e7eb; text-align: right;">${formatCurrency(totalExpenses)}</td>
                        <td style="${tdStyle} border-top: 2px solid #e5e7eb; text-align: right;">100%</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; text-align: center;">
                <div style="font-weight: bold; color: #1e40af; text-transform: uppercase;">Utilidad Neta (Estimada)</div>
                <div style="font-size: 32px; font-weight: 800; color: #1d4ed8;">${formatCurrency(netProfit)}</div>
                <div style="font-size: 12px; color: #1e40af;">(Ingresos Facturados - Gastos Totales)</div>
            </div>
            <div style="margin-top: 10px; text-align: center; font-size: 12px; color: #6b7280;">
                Flujo de Caja Real (Cobrado - Gastos): <strong>${formatCurrency(cashFlow)}</strong>
            </div>
        `;
        printReport("Reporte Financiero", content);
    };

    const handleVehicleProfitability = () => {
        const filteredMaintenances = maintenances.filter(m => filterByDate(m.date));

        const vehicleStats = vehicles.map(v => {
            const vRentals = rentals.filter(r => r.vehicleId === v.id).filter(r => {
                const rStart = new Date(r.startDate).getTime();
                const rEnd = r.endDate ? new Date(r.endDate).getTime() : new Date().getTime();
                const rangeStart = new Date(dateRange.start).getTime();
                const rangeEnd = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000);
                return rStart < rangeEnd && rEnd > rangeStart;
            });

            const income = vRentals.reduce((sum, r) => {
                const rStart = new Date(r.startDate).getTime();
                const rEnd = r.endDate ? new Date(r.endDate).getTime() : new Date().getTime();
                const rangeStart = new Date(dateRange.start).getTime();
                const rangeEnd = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000) - 1;

                const overlapStart = Math.max(rStart, rangeStart);
                const overlapEnd = Math.min(rEnd, rangeEnd);

                if (overlapEnd < overlapStart) return sum;

                const days = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) || 1;
                return sum + (days * r.dailyRate);
            }, 0);

            const cost = filteredMaintenances.filter(m => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0);

            return {
                name: v.name,
                plate: v.plate,
                income,
                cost,
                profit: income - cost,
                trips: vRentals.length
            };
        }).sort((a, b) => b.profit - a.profit);

        const content = `
            <div style="${sectionTitleStyle}">Rentabilidad por Vehículo</div>
            <p style="font-size:11px; color:#6b7280; margin-bottom:10px;">Ingresos calculados proporcionalmente a los días rentados dentro del periodo seleccionado.</p>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Vehículo</th>
                        <th style="${thStyle}">Placa</th>
                        <th style="${thStyle} text-align: center;">Rentas (en periodo)</th>
                        <th style="${thStyle} text-align: right;">Ingresos (Est.)</th>
                        <th style="${thStyle} text-align: right;">Costo Mant.</th>
                        <th style="${thStyle} text-align: right;">Utilidad</th>
                    </tr>
                </thead>
                <tbody>
                    ${vehicleStats.map(v => `
                        <tr>
                            <td style="${tdStyle}"><strong>${v.name}</strong></td>
                            <td style="${tdStyle}">${v.plate}</td>
                            <td style="${tdStyle} text-align: center;">${v.trips}</td>
                            <td style="${tdStyle} text-align: right; color: #059669;">${formatCurrency(v.income)}</td>
                            <td style="${tdStyle} text-align: right; color: #dc2626;">${formatCurrency(v.cost)}</td>
                            <td style="${tdStyle} text-align: right; font-weight: bold; color: ${v.profit >= 0 ? '#111827' : '#dc2626'};">
                                ${formatCurrency(v.profit)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        printReport("Rentabilidad de Flota", content);
    };

    const handleBillingBreakdown = () => {
        const filteredInvoices = invoices.filter(i => filterByDate(i.date)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const total = filteredInvoices.reduce((s, i) => s + i.amount, 0);

        const content = `
             <div style="${sectionTitleStyle}">Desglose de Facturación</div>
             <div style="margin-bottom: 20px; padding: 10px; background: #ecfdf5; border-left: 4px solid #10b981;">
                Total Facturado en Periodo: <strong>${formatCurrency(total)}</strong>
            </div>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Fecha</th>
                        <th style="${thStyle}">Factura #</th>
                        <th style="${thStyle}">Cliente</th>
                        <th style="${thStyle}">Concepto</th>
                        <th style="${thStyle}">Estado</th>
                        <th style="${thStyle} text-align: right;">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredInvoices.map(i => {
            const client = clients.find(c => c.id === i.clientId);
            return `
                            <tr>
                                <td style="${tdStyle}">${new Date(i.date).toLocaleDateString()}</td>
                                <td style="${tdStyle}">${i.invoiceNumber || (i.id ? i.id.slice(0, 8) : '---')}</td>
                                <td style="${tdStyle}">${client?.name || '---'}</td>
                                <td style="${tdStyle}">${i.rentalDetails?.note || '---'}</td>
                                <td style="${tdStyle}">${i.status}</td>
                                <td style="${tdStyle} text-align: right;">${formatCurrency(i.amount)}</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
        printReport("Desglose de Facturación", content);
    };

    const handleExpensesByCategory = () => {
        const filteredExpenses = expenses.filter(e => filterByDate(e.date));

        // Group by category logic to be refined, listing all for now
        const content = `
            <div style="${sectionTitleStyle}">Gastos por Categoría</div>
             <p style="font-size:12px; color: #6b7280;">Listado detallado de gastos en el periodo.</p>
             <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Fecha</th>
                        <th style="${thStyle}">Descripción</th>
                        <th style="${thStyle} text-align: right;">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredExpenses.map(e => `
                        <tr>
                            <td style="${tdStyle}">${new Date(e.date).toLocaleDateString()}</td>
                            <td style="${tdStyle}">${e.description}</td>
                            <td style="${tdStyle} text-align: right;">${formatCurrency(e.amount)}</td>
                        </tr>
                    `).join('')}
                    <tr style="font-weight: bold; background-color: #f9fafb;">
                        <td style="${tdStyle} text-align: right;" colspan="2">TOTAL</td>
                        <td style="${tdStyle} text-align: right;">${formatCurrency(filteredExpenses.reduce((s, e) => s + e.amount, 0))}</td>
                    </tr>
                </tbody>
             </table>
        `;
        printReport("Gastos por Categoría", content);
    };

    // ==========================================
    // 2. FLEET REPORTS
    // ==========================================

    const handleFleetStatus = () => {
        // Snapshot Reports - usually show CURRENT status regardless of date filter,
        // but user might want "Status as of [End Date]". Complexity high.
        // Decision: Show current status but add note. Or just show current.
        // Let's keep it as current snapshot for simplicity and utility.

        const available = vehicles.filter(v => v.status === 'Disponible');
        const rented = vehicles.filter(v => v.status === 'Rentado');
        const maintenance = vehicles.filter(v => v.status === 'Mantenimiento');

        const content = `
            <div style="${sectionTitleStyle}">Estado Actual de la Flota</div>
            <p style="font-size:11px; color:#6b7280; margin-bottom:10px;">Este reporte muestra el estado en tiempo real, el filtro de fechas no aplica a la disponibilidad actual.</p>
            
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">${available.length}</div>
                    <div style="font-size: 11px; text-transform: uppercase; color: #6b7280;">Disponibles</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #d97706;">${rented.length}</div>
                    <div style="font-size: 11px; text-transform: uppercase; color: #6b7280;">Rentados</div>
                </div>
                <div style="flex: 1; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${maintenance.length}</div>
                    <div style="font-size: 11px; text-transform: uppercase; color: #6b7280;">En Mantenimiento</div>
                </div>
            </div>

            ${maintenance.length > 0 ? `
                <div style="font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Vehículos en Taller</div>
                <table style="${tableStyle}">
                    <thead>
                        <tr>
                            <th style="${thStyle}">Vehículo</th>
                            <th style="${thStyle}">Motivo/Estado</th>
                            <th style="${thStyle}">Costo Acumulado (Mantenimientos)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${maintenance.map(v => {
            const vMaints = maintenances.filter(m => m.vehicleId === v.id && m.status !== 'Completado');
            const description = vMaints.length > 0 ? vMaints[0].description : 'Mantenimiento General';
            const activeCost = vMaints.reduce((s, m) => s + m.cost, 0);
            return `
                                <tr>
                                    <td style="${tdStyle}">${v.name} (${v.plate})</td>
                                    <td style="${tdStyle}">${description}</td>
                                    <td style="${tdStyle}">${formatCurrency(activeCost)}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            ` : ''}

            <div style="font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Inventario Completo</div>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Vehículo</th>
                        <th style="${thStyle}">Placa</th>
                        <th style="${thStyle}">Tipo</th>
                        <th style="${thStyle}">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${vehicles.map(v => `
                        <tr>
                            <td style="${tdStyle}">${v.name}</td>
                            <td style="${tdStyle}">${v.plate}</td>
                            <td style="${tdStyle}">${v.type}</td>
                            <td style="${tdStyle}">
                                <span style="font-weight: bold; color: ${v.status === 'Disponible' ? '#059669' :
                v.status === 'Rentado' ? '#d97706' : '#dc2626'
            }">${v.status}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        printReport("Reporte de Flota", content);
    };

    const handleActiveRentals = () => {
        const active = rentals.filter(r => r.status === 'Activo');

        const content = `
            <div style="${sectionTitleStyle}">Rentas Activas (${active.length})</div>
            <p style="font-size:11px; color:#6b7280; margin-bottom:10px;">Listado de rentas actualmente en curso.</p>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Cliente</th>
                        <th style="${thStyle}">Vehículo</th>
                        <th style="${thStyle}">Fecha Inicio</th>
                        <th style="${thStyle}">Fecha Fin (Prevista)</th>
                        <th style="${thStyle} text-align: right;">Tarifa Diaria</th>
                        <th style="${thStyle} text-align: right;">Total Estimado</th>
                    </tr>
                </thead>
                <tbody>
                    ${active.map(r => {
            const client = clients.find(c => c.id === r.clientId);
            const vehicle = vehicles.find(v => v.id === r.vehicleId);
            const days = Math.ceil((new Date().getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;
            const estimated = days * r.dailyRate;
            return `
                            <tr>
                                <td style="${tdStyle}"><strong>${client?.name || '---'}</strong></td>
                                <td style="${tdStyle}">${vehicle?.name || '---'}</td>
                                <td style="${tdStyle}">${new Date(r.startDate).toLocaleDateString()}</td>
                                <td style="${tdStyle}">${r.endDate ? new Date(r.endDate).toLocaleDateString() : 'Indefinido'}</td>
                                <td style="${tdStyle} text-align: right;">${formatCurrency(r.dailyRate)}</td>
                                <td style="${tdStyle} text-align: right;">${formatCurrency(estimated)} <span style="font-size:10px; color:#6b7280;">(${days} días)</span></td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
        printReport("Rentas Activas", content);
    };

    const handleRentalHistory = () => {
        const history = rentals.filter(r => r.status === 'Finalizado')
            .filter(r => filterByDate(r.startDate))
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        const content = `
            <div style="${sectionTitleStyle}">Historial de Rentas Finalizadas</div>
            <div style="margin-bottom: 20px;">
                Total Rentas en Periodo: <strong>${history.length}</strong>
            </div>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Cliente</th>
                        <th style="${thStyle}">Vehículo</th>
                        <th style="${thStyle}">Periodo</th>
                        <th style="${thStyle} text-align: right;">Total Facturado</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(r => {
            const client = clients.find(c => c.id === r.clientId);
            const vehicle = vehicles.find(v => v.id === r.vehicleId);
            return `
                            <tr>
                                <td style="${tdStyle}">${client?.name || '---'}</td>
                                <td style="${tdStyle}">${vehicle?.name || '---'}</td>
                                <td style="${tdStyle}">${new Date(r.startDate).toLocaleDateString()} - ${r.endDate ? new Date(r.endDate).toLocaleDateString() : 'N/A'}</td>
                                <td style="${tdStyle} text-align: right;">${r.totalAmount ? formatCurrency(r.totalAmount) : '-'}</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
        printReport("Historial de Rentas", content);
    };

    const handleMaintenanceReport = () => {
        const filteredMaintenances = maintenances.filter(m => filterByDate(m.date));
        const totalCost = filteredMaintenances.reduce((s, m) => s + m.cost, 0);

        const content = `
            <div style="${sectionTitleStyle}">Reporte de Mantenimientos</div>
            <div style="margin-bottom: 20px; padding: 10px; background: #fef2f2; border-left: 4px solid #dc2626;">
                Total Gastado en Periodo: <strong>${formatCurrency(totalCost)}</strong>
            </div>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Fecha</th>
                        <th style="${thStyle}">Vehículo</th>
                        <th style="${thStyle}">Descripción</th>
                        <th style="${thStyle}">Estado</th>
                        <th style="${thStyle} text-align: right;">Costo</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredMaintenances.map(m => {
            const vehicle = vehicles.find(v => v.id === m.vehicleId);
            return `
                            <tr>
                                <td style="${tdStyle}">${new Date(m.date).toLocaleDateString()}</td>
                                <td style="${tdStyle}">${vehicle?.name || '---'}</td>
                                <td style="${tdStyle}">${m.description}</td>
                                <td style="${tdStyle}">${m.status}</td>
                                <td style="${tdStyle} text-align: right;">${formatCurrency(m.cost)}</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
         `;
        printReport("Mantenimientos", content);
    };

    // ==========================================
    // 3. HR REPORTS
    // ==========================================

    const handlePayrollHistory = () => {
        const filteredPayrolls = payrolls.filter(p => {
            const pDate = new Date(p.year, p.month - 1, 1);
            return filterByDate(pDate);
        }).sort((a, b) => b.year - a.year || b.month - a.month);

        const content = `
            <div style="${sectionTitleStyle}">Histórico de Nóminas - Staff</div>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Periodo (Mes/Año)</th>
                        <th style="${thStyle}">Estado</th>
                        <th style="${thStyle} text-align: right;">Total Pagado</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredPayrolls.map(p => {
            const monthName = new Date(2000, p.month - 1, 1).toLocaleString('es-ES', { month: 'long' });
            return `
                            <tr>
                                <td style="${tdStyle}"><strong>${monthName} ${p.year}</strong></td>
                                <td style="${tdStyle}">${p.status}</td>
                                <td style="${tdStyle} text-align: right;">${formatCurrency(p.totalAmount)}</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
        printReport("Reporte de Nómina", content);
    };

    const handleDriverPayments = () => {
        const sortedPayments = driverPayments.filter(p => filterByDate(p.date))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const total = sortedPayments.reduce((s, p) => s + p.amount, 0);

        const content = `
            <div style="${sectionTitleStyle}">Reporte de Pagos a Conductores</div>
            <div style="margin-bottom: 20px; padding: 10px; background: #fff7ed; border-left: 4px solid #f97316;">
                Total Pagado en Periodo: <strong>${formatCurrency(total)}</strong>
            </div>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Fecha</th>
                        <th style="${thStyle}">Conductor</th>
                        <th style="${thStyle}">Concepto/Notas</th>
                        <th style="${thStyle} text-align: right;">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedPayments.map(p => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const driver = personnel.find((ps: any) => ps.id === p.personnelId);

            return `
                            <tr>
                                <td style="${tdStyle}">${new Date(p.date).toLocaleDateString()}</td>
                                <td style="${tdStyle}"><strong>${driver?.name || '---'}</strong><br><span style="font-size:10px; color:#6b7280;">${driver?.id ? `ID: ${driver.id.slice(0, 6)}` : ''}</span></td>
                                <td style="${tdStyle}">
                                    <strong>${p.concept}</strong>
                                    ${p.notes ? `<br><span style="color: #9ca3af; font-size: 10px;">${p.notes}</span>` : ''}
                                </td>
                                <td style="${tdStyle} text-align: right;">${formatCurrency(p.amount)}</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
        printReport("Pagos a Conductores", content);
    };

    const handleDriverPerformance = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const drivers = personnel.filter((p: any) => p.role === 'Conductor');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const driverStats = drivers.map((d: any) => {
            const payments = driverPayments.filter(p => p.personnelId === d.id && filterByDate(p.date));
            const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
            return { ...d, totalPaid, count: payments.length };
        }).sort((a: any, b: any) => b.totalPaid - a.totalPaid);

        const content = `
            <div style="${sectionTitleStyle}">Análisis de Costos de Conductores</div>
            <p style="font-size:11px; color:#6b7280;">Total pagado a cada conductor en el periodo seleccionado.</p>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Conductor</th>
                        <th style="${thStyle}">Teléfono</th>
                        <th style="${thStyle} text-align: center;">Pagos Realizados</th>
                        <th style="${thStyle} text-align: right;">Total Recibido</th>
                    </tr>
                </thead>
                <tbody>
                    ${driverStats.map((d: any) => `
                        <tr>
                            <td style="${tdStyle}"><strong>${d.name}</strong></td>
                            <td style="${tdStyle}">${d.phone}</td>
                            <td style="${tdStyle} text-align: center;">${d.count}</td>
                            <td style="${tdStyle} text-align: right;">${formatCurrency(d.totalPaid)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        printReport("Rendimiento Conductores", content);
    };

    const handleStaffList = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const staff = personnel.filter((p: any) => p.status === 'Activo').sort((a: any, b: any) => a.role.localeCompare(b.role));

        const content = `
            <div style="${sectionTitleStyle}">Listado de Personal Activo</div>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Nombre</th>
                        <th style="${thStyle}">Rol</th>
                        <th style="${thStyle}">Contacto</th>
                        <th style="${thStyle} text-align: right;">Salario Base</th>
                    </tr>
                </thead>
                <tbody>
                    ${staff.map((p: any) => `
                        <tr>
                            <td style="${tdStyle}"><strong>${p.name}</strong><br><span style="font-size:10px; color:#6b7280;">${p.dni}</span></td>
                            <td style="${tdStyle}">${p.role}</td>
                            <td style="${tdStyle}">${p.phone}<br>${p.email || ''}</td>
                            <td style="${tdStyle} text-align: right;">${p.salary ? formatCurrency(p.salary) : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        printReport("Listado de Personal", content);
    };

    // ==========================================
    // 4. CLIENT REPORTS
    // ==========================================

    const handleRevenueByClient = () => {
        const clientRanking = clients.map(c => {
            const periodInvoices = invoices.filter(i => i.clientId === c.id && filterByDate(i.date));
            const totalSpent = periodInvoices.reduce((sum, i) => sum + i.amount, 0);
            return { ...c, totalSpent, invoiceCount: periodInvoices.length };
        }).filter(c => c.totalSpent > 0).sort((a, b) => b.totalSpent - a.totalSpent);

        const content = `
            <div style="${sectionTitleStyle}">Facturación por Cliente (Top 20)</div>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">#</th>
                        <th style="${thStyle}">Cliente</th>
                        <th style="${thStyle}">Email</th>
                        <th style="${thStyle} text-align: center;">Facturas</th>
                        <th style="${thStyle} text-align: right;">Total Facturado</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientRanking.slice(0, 20).map((c, idx) => `
                        <tr>
                             <td style="${tdStyle} font-weight: bold;">${idx + 1}</td>
                            <td style="${tdStyle}"><strong>${c.name}</strong></td>
                            <td style="${tdStyle}">${c.email}</td>
                            <td style="${tdStyle} text-align: center;">${c.invoiceCount}</td>
                            <td style="${tdStyle} text-align: right; color: #059669; font-weight: bold;">${formatCurrency(c.totalSpent)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        printReport("Facturación por Cliente", content);
    };

    const handleRentalsByClient = () => {
        const clientRentals = clients.map(c => {
            const periodRentals = rentals.filter(r => r.clientId === c.id && r.status === 'Finalizado').filter(r => filterByDate(r.startDate));
            const totalDays = periodRentals.reduce((sum, r) => {
                const days = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;
                return sum + days;
            }, 0);
            return { ...c, rentalCount: periodRentals.length, totalDays };
        }).filter(c => c.rentalCount > 0).sort((a, b) => b.rentalCount - a.rentalCount);

        const content = `
            <div style="${sectionTitleStyle}">Rentas por Cliente</div>
            <p style="font-size:11px; color:#6b7280;">Clientes con rentas finalizadas iniciadas en el periodo.</p>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Cliente</th>
                        <th style="${thStyle}">Contacto</th>
                        <th style="${thStyle} text-align: center;">Total Rentas</th>
                        <th style="${thStyle} text-align: center;">Días Totales</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientRentals.slice(0, 20).map(c => `
                        <tr>
                            <td style="${tdStyle}"><strong>${c.name}</strong></td>
                             <td style="${tdStyle}">${c.phone}</td>
                            <td style="${tdStyle} text-align: center;">${c.rentalCount}</td>
                            <td style="${tdStyle} text-align: center;">${c.totalDays}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        printReport("Rentas por Cliente", content);
    };

    const handleClientBalances = () => {
        // Snapshot of current debt
        const debtClients = clients.map(c => {
            const clientInvoices = invoices.filter(i => i.clientId === c.id);
            const totalDebt = clientInvoices.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
            return {
                ...c,
                totalDebt,
                pendingInvoices: clientInvoices.filter(i => i.status !== 'Pagado').length
            };
        }).filter(c => c.totalDebt > 0).sort((a, b) => b.totalDebt - a.totalDebt);

        const content = `
            <div style="${sectionTitleStyle}">Reporte de Deuda de Clientes (Snapshot)</div>
             <p style="font-size:11px; color:#6b7280;">Estado de deuda actual (filtro de fecha no aplica).</p>
            ${debtClients.length > 0 ? `
                <table style="${tableStyle}">
                    <thead>
                        <tr>
                            <th style="${thStyle}">Cliente</th>
                            <th style="${thStyle}">Contacto</th>
                            <th style="${thStyle} text-align: center;">Facturas Pendientes</th>
                            <th style="${thStyle} text-align: right;">Deuda Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${debtClients.map(c => `
                            <tr>
                                <td style="${tdStyle}"><strong>${c.name}</strong><br><span style="font-size:10px;">${c.dni}</span></td>
                                <td style="${tdStyle}">${c.phone}<br>${c.email}</td>
                                <td style="${tdStyle} text-align: center;">${c.pendingInvoices}</td>
                                <td style="${tdStyle} text-align: right; color: #dc2626; font-weight: bold;">${formatCurrency(c.totalDebt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>No hay clientes con deuda pendiente.</p>'}
        `;
        printReport("Deudas de Clientes", content);
    };

    const handleClientDirectory = () => {
        // Simple directory
        const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));

        const content = `
             <div style="${sectionTitleStyle}">Directorio de Clientes</div>
              <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Nombre/Razón Social</th>
                        <th style="${thStyle}">DNI/RUC</th>
                        <th style="${thStyle}">Email</th>
                        <th style="${thStyle}">Teléfono</th>
                         <th style="${thStyle}">Dirección</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedClients.map(c => `
                        <tr>
                            <td style="${tdStyle}"><strong>${c.name}</strong></td>
                            <td style="${tdStyle}">${c.dni}</td>
                            <td style="${tdStyle}">${c.email}</td>
                            <td style="${tdStyle}">${c.phone}</td>
                             <td style="${tdStyle} font-size: 10px;">${c.address}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        printReport("Directorio de Clientes", content);
    };


    // UI CONFIGURATION
    const reports = [
        {
            category: "Finanzas",
            items: [
                { title: "Estado de Resultados", icon: Wallet, action: handleIncomeStatement, color: "text-emerald-500" },
                { title: "Rentabilidad por Vehículo", icon: TrendingUp, action: handleVehicleProfitability, color: "text-emerald-600" },
                { title: "Desglose de Facturación", icon: FileText, action: handleBillingBreakdown, color: "text-emerald-400" },
                { title: "Gastos por Categoría", icon: PieChart, action: handleExpensesByCategory, color: "text-emerald-700" },
            ]
        },
        {
            category: "Operaciones y Flota",
            items: [
                { title: "Estado de Flota", icon: Car, action: handleFleetStatus, color: "text-blue-500" },
                { title: "Rentas Activas", icon: Calendar, action: handleActiveRentals, color: "text-blue-600" },
                { title: "Historial de Rentas", icon: History, action: handleRentalHistory, color: "text-purple-500" },
                { title: "Mantenimientos", icon: Wrench, action: handleMaintenanceReport, color: "text-red-500" },
            ]
        },
        {
            category: "Recursos Humanos",
            items: [
                { title: "Histórico de Nóminas", icon: Users, action: handlePayrollHistory, color: "text-orange-500" },
                { title: "Pagos a Conductores", icon: Banknote, action: handleDriverPayments, color: "text-orange-600" },
                { title: "Costo Conductores", icon: TrendingUp, action: handleDriverPerformance, color: "text-orange-400" },
                { title: "Listado de Personal", icon: UserCheck, action: handleStaffList, color: "text-orange-700" },
            ]
        },
        {
            category: "Clientes",
            items: [
                { title: "Facturación por Cliente", icon: Banknote, action: handleRevenueByClient, color: "text-indigo-500" },
                { title: "Rentas por Cliente", icon: History, action: handleRentalsByClient, color: "text-indigo-400" },
                { title: "Deudas y Saldos", icon: AlertCircle, action: handleClientBalances, color: "text-red-600" },
                { title: "Directorio Clientes", icon: Users, action: handleClientDirectory, color: "text-indigo-700" },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Centro de Reportes</h2>
                    <p className="text-muted-foreground mt-2">
                        Análisis detallado y exportación de datos de todas las áreas del sistema.
                    </p>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
                    <div className="flex flex-col">
                        <label className="text-xs text-muted-foreground ml-1">Desde</label>
                        <input
                            type="date"
                            className="bg-transparent border-none text-sm font-medium focus:ring-0"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="h-8 w-[1px] bg-border"></div>
                    <div className="flex flex-col">
                        <label className="text-xs text-muted-foreground ml-1">Hasta</label>
                        <input
                            type="date"
                            className="bg-transparent border-none text-sm font-medium focus:ring-0"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                    <div className="h-8 w-[1px] bg-border"></div>
                    <button
                        onClick={() => setDateRange({
                            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                            end: new Date().toISOString().split('T')[0]
                        })}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2"
                    >
                        Mes Actual
                    </button>
                </div>
            </div>

            <div className="grid gap-8">
                {reports.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                            <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                            {section.category}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {section.items.map((report, rIdx) => (
                                <Card
                                    key={rIdx}
                                    className="cursor-pointer hover:shadow-lg transition-all border-border bg-card group hover:-translate-y-1 relative overflow-hidden"
                                    onClick={report.action}
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-muted/20 rounded-bl-full"></div>
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                        <div className={`p-3 rounded-full bg-muted/50 group-hover:bg-muted transition-colors ${report.color}`}>
                                            <report.icon size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="font-medium text-sm text-foreground">{report.title}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
