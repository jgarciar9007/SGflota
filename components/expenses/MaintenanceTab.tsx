"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Wrench, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MaintenanceTab() {
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
            cost: parseFloat(formData.cost.replace(/\s/g, '')),
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
                    <h3 className="text-xl font-bold text-foreground">Mantenimiento de Vehículos</h3>
                    <p className="text-sm text-muted-foreground">Programa y gestiona las reparaciones y servicios.</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Programar Mantenimiento
                </Button>
            </div>

            <div className="space-y-3">
                {maintenances.map((maintenance) => {
                    const vehicle = vehicles.find((v) => v.id === maintenance.vehicleId);

                    return (
                        <Card key={maintenance.id} className="border-border bg-card hover:bg-accent/50 transition-colors shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                        <div>
                                            <h3 className="font-bold text-foreground">{vehicle?.name}</h3>
                                            <p className="text-sm text-muted-foreground">{vehicle?.plate}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Wrench className="h-4 w-4 text-orange-500" />
                                            {maintenance.description}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            {new Date(maintenance.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            {formatCurrency(maintenance.cost)}
                                        </div>
                                        <div className="flex items-center justify-end gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${maintenance.status === 'Completado'
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : maintenance.status === 'En Proceso'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
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
                <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">No hay mantenimientos programados</p>
            )}

            {/* Add Maintenance Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                            <CardTitle className="text-foreground">Programar Mantenimiento</CardTitle>
                            <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Vehículo</label>
                                    <select
                                        value={formData.vehicleId}
                                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
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
                                    <label className="text-sm text-muted-foreground font-medium">Descripción</label>
                                    <Input
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Cambio de aceite, revisión general..."
                                        className="bg-background border-input text-foreground mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Fecha Programada</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="bg-background border-input text-foreground mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Costo Estimado</label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            value={formData.cost}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                setFormData({ ...formData, cost: formatted });
                                            }}
                                            className="bg-background border-input text-foreground mt-1 pr-12"
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-[calc(50%-2px)] text-muted-foreground text-xs font-medium">FCFA</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border pt-6">
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
