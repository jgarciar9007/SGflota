"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ReportCard } from "./ReportCard";
import { Car, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#059669', '#2563eb', '#dc2626']; // Green, Blue, Red

export function FleetReport() {
    const { vehicles, rentals } = useData();

    // Stats
    const totalVehicles = vehicles.length;
    const available = vehicles.filter(v => v.status === 'Disponible').length;
    const rented = vehicles.filter(v => v.status === 'Rentado').length;
    const maintenance = vehicles.filter(v => v.status === 'Mantenimiento').length;

    const utilizationRate = totalVehicles > 0 ? ((rented / totalVehicles) * 100).toFixed(1) : "0";

    // Chart Data
    const statusData = [
        { name: 'Disponible', value: available },
        { name: 'Rentado', value: rented },
        { name: 'Mantenimiento', value: maintenance },
    ];

    // Top Rented Vehicles (based on current rentals count logic - expanding to historical if possible)
    const vehicleRentalsCount: Record<string, number> = {};
    rentals.forEach(r => {
        vehicleRentalsCount[r.vehicleId] = (vehicleRentalsCount[r.vehicleId] || 0) + 1;
    });

    const topVehicles = Object.entries(vehicleRentalsCount)
        .map(([id, count]) => {
            const v = vehicles.find(veh => veh.id === id);
            return { name: v?.name || 'Unknown', count, plate: v?.plate };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ReportCard
                    title="Total Flota"
                    value={totalVehicles}
                    icon={Car}
                    iconColor="text-gray-500"
                />
                <ReportCard
                    title="Tasa de Utilización"
                    value={`${utilizationRate}%`}
                    icon={Clock}
                    iconColor="text-blue-500"
                    description="Vehículos actualmente rentados"
                />
                <ReportCard
                    title="Disponibles"
                    value={available}
                    icon={CheckCircle}
                    iconColor="text-green-500"
                />
                <ReportCard
                    title="En Mantenimiento"
                    value={maintenance}
                    icon={AlertTriangle}
                    iconColor="text-red-500"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Estado de la Flota</CardTitle>
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
                        <CardTitle>Vehículos Más Rentados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topVehicles} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#2563eb" name="Total Rentas" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
