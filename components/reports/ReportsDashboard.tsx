"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { OverviewTab } from "./OverviewTab";
import { FleetReport } from "./FleetReport";
import { FinancialReport } from "./FinancialReport";
import { MaintenanceReport } from "./MaintenanceReport";
import { PersonnelReport } from "./PersonnelReport";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

export function ReportsDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    const handleExport = () => {
        // Placeholder for export functionality
        // Could implement generic CSV export or specific PDF generation based on active tab
        alert("Función de exportación completa próximamente. Por ahora use los botones de PDF individuales en cada sección si están disponibles, o Imprimir pantalla.");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Panel de Reportes</h2>
                    <p className="text-muted-foreground">
                        Visualización de indicadores clave y rendimiento del negocio.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* DateRangePicker could go here */}
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Exportar
                    </Button>
                </div>
            </div>

            <Tabs className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" activeValue={activeTab} onValueChange={setActiveTab}>Resumen</TabsTrigger>
                    <TabsTrigger value="fleet" activeValue={activeTab} onValueChange={setActiveTab}>Flota</TabsTrigger>
                    <TabsTrigger value="financial" activeValue={activeTab} onValueChange={setActiveTab}>Financiero</TabsTrigger>
                    <TabsTrigger value="maintenance" activeValue={activeTab} onValueChange={setActiveTab}>Mantenimiento</TabsTrigger>
                    <TabsTrigger value="personnel" activeValue={activeTab} onValueChange={setActiveTab}>Personal</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" activeValue={activeTab} className="space-y-4">
                    <OverviewTab />
                </TabsContent>

                <TabsContent value="fleet" activeValue={activeTab} className="space-y-4">
                    <FleetReport />
                </TabsContent>

                <TabsContent value="financial" activeValue={activeTab} className="space-y-4">
                    <FinancialReport />
                </TabsContent>

                <TabsContent value="maintenance" activeValue={activeTab} className="space-y-4">
                    <MaintenanceReport />
                </TabsContent>

                <TabsContent value="personnel" activeValue={activeTab} className="space-y-4">
                    <PersonnelReport />
                </TabsContent>
            </Tabs>
        </div>
    );
}
