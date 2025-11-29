"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Wrench, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MaintenancePage() {
    const { maintenances, vehicles, addMaintenance, updateMaintenance, currentUser, canEdit } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        vehicleId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        cost: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addMaintenance({
            ...formData,
            cost: parseFloat(formData.cost),
            status: "Programado",
        });
        setShowAddModal(false);
        setFormData({
            vehicleId: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
            cost: "",
        });
    };

    const handleStatusChange = (id: string, status: "Programado" | "En Proceso" | "Completado") => {
        updateMaintenance(id, { status });
    };

    const availableVehicles = vehicles.filter((v) => v.status !== "Mantenimiento");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Mantenimiento</h2>
                    <p className="text-gray-300">Programa y gestiona el mantenimiento de vehículos.</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    disabled={availableVehicles.length === 0}
                >
                    <Plus className="mr-2 h-4 w-4" /> Programar Mantenimiento
                </Button>
            </div>

            <div className="space-y-3">
                {maintenances.map((maintenance) => {
                    const vehicle = vehicles.find((v) => v.id === maintenance.vehicleId);

                    return (
                        <Card key={maintenance.id} className="border-gray-700 bg-gray-800/50 backdrop-blur hover:bg-gray-800/70 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                        <div>
                                            <h3 className="font-bold text-white">{vehicle?.name}</h3>
                                            <p className="text-sm text-gray-300">{vehicle?.plate}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <Wrench className="h-4 w-4 text-orange-400" />
                                            {maintenance.description}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <Calendar className="h-4 w-4 text-blue-400" />
                                            {new Date(maintenance.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <DollarSign className="h-4 w-4 text-green-400" />
                                            {formatCurrency(maintenance.cost)}
                                        </div>
                                        <div className="flex items-center justify-end gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${maintenance.status === 'Completado'
                                                ? 'bg-green-600 text-white border-green-500'
                                                : maintenance.status === 'En Proceso'
                                                    ? 'bg-blue-600 text-white border-blue-500'
                                                    : 'bg-yellow-600 text-white border-yellow-500'
                                                }`}>
                                                {maintenance.status}
                                            </span>
                                            {canEdit(currentUser) && maintenance.status === "Programado" && (
                                                <Button
                                                    onClick={() => handleStatusChange(maintenance.id, "En Proceso")}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                                >
                                                    Iniciar
                                                </Button>
                                            )}
                                            {canEdit(currentUser) && maintenance.status === "En Proceso" && (
                                                <Button
                                                    onClick={() => handleStatusChange(maintenance.id, "Completado")}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-sm"
                                                >
                                                    Completar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            {maintenances.length === 0 && (
                <p className="text-gray-400 text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700">No hay mantenimientos programados</p>
            )}

            {/* Add Maintenance Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-gray-700 bg-gray-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
                            <CardTitle className="text-white">Programar Mantenimiento</CardTitle>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Vehículo</label>
                                    <select
                                        value={formData.vehicleId}
                                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white mt-1"
                                        required
                                    >
                                        <option value="">Seleccionar vehículo</option>
                                        {availableVehicles.map((vehicle) => (
                                            <option key={vehicle.id} value={vehicle.id}>
                                                {vehicle.name} - {vehicle.plate}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Descripción</label>
                                    <Input
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Cambio de aceite, revisión general..."
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Fecha Programada</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Costo Estimado (FCFA)</label>
                                    <Input
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-700 pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Programar
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
