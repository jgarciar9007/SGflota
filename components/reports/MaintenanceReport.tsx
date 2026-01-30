"use client";

import { useData } from "@/context/DataContext";
import { ReportCard } from "./ReportCard";
import { Wrench, AlertCircle, CheckSquare, Settings } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const COLORS = ['#2563eb', '#f59e0b', '#10b981']; // Blue, Amber, Green

export function MaintenanceReport() {
    const { maintenances, vehicles } = useData();

    // Stats
    const totalCost = maintenances.reduce((sum, m) => sum + m.cost, 0);
    const totalServices = maintenances.length;
    const pendingServices = maintenances.filter(m => m.status === 'Programado' || m.status === 'En Proceso').length;
    const avgCost = totalServices > 0 ? totalCost / totalServices : 0;

    // Chart Data: Status Distribution
    const statusCounts = {
        'Programado': 0,
        'En Proceso': 0,
        'Completado': 0
    };
    maintenances.forEach(m => {
        if (statusCounts[m.status as keyof typeof statusCounts] !== undefined) {
            statusCounts[m.status as keyof typeof statusCounts]++;
        }
    });

    const statusData = [
        { name: 'En Proceso', value: statusCounts['En Proceso'] },
        { name: 'Programado', value: statusCounts['Programado'] },
        { name: 'Completado', value: statusCounts['Completado'] },
    ];

    // Chart Data: Cost by Vehicle (Top 5)
    const vehicleCost: Record<string, number> = {};
    maintenances.forEach(m => {
        vehicleCost[m.vehicleId] = (vehicleCost[m.vehicleId] || 0) + m.cost;
    });

    const topCosts = Object.entries(vehicleCost)
        .map(([id, cost]) => {
            const v = vehicles.find(veh => veh.id === id);
            return { name: v?.name || 'Unknown', cost, plate: v?.plate };
        })
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ReportCard
                    title="Costo Total"
                    value={formatCurrency(totalCost)}
                    icon={Wrench}
                    iconColor="text-red-600"
                />
                <ReportCard
                    title="Servicios Totales"
                    value={totalServices}
                    icon={Settings}
                    iconColor="text-blue-600"
                />
                <ReportCard
                    title="Pendientes"
                    value={pendingServices}
                    icon={AlertCircle}
                    iconColor="text-amber-600"
                />
                <ReportCard
                    title="Costo Promedio"
                    value={formatCurrency(avgCost)}
                    icon={CheckSquare}
                    description="Por servicio"
                    iconColor="text-gray-600"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Estado de Mantenimientos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Vehículos con Mayor Gasto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topCosts} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(val) => `${val / 1000}k`} />
                                    <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Bar dataKey="cost" fill="#ef4444" name="Costo Mantenimiento" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
