"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Wrench, Calendar, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MaintenancePage() {
    const { maintenances, vehicles, addMaintenance, deleteMaintenance, updateMaintenance, currentUser, canEdit } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        vehicleId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        cost: "",
        type: "Preventivo"
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
            type: "Preventivo"
        });
    };

    const handleStatusChange = async (id: string, status: "Programado" | "En Proceso" | "Completado") => {
        setUpdatingId(id);
        try {
            await updateMaintenance(id, { status });
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Mantenimiento</h2>
                    <p className="text-muted-foreground">Programa y registra los mantenimientos de la flota.</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Registrar Mantenimiento
                </Button>
            </div>

            <div className="space-y-3">
                {maintenances.map((maintenance) => {
                    const vehicle = vehicles.find((v) => v.id === maintenance.vehicleId);

                    return (
                        <Card key={maintenance.id} className="border-border bg-card hover:bg-accent/50 transition-colors group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-foreground">{vehicle?.name} ({vehicle?.plate})</CardTitle>
                                {canEdit(currentUser) ? (
                                    <select
                                        value={maintenance.status}
                                        onChange={(e) => handleStatusChange(maintenance.id, e.target.value as "Programado" | "En Proceso" | "Completado")}
                                        disabled={updatingId === maintenance.id}
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border bg-transparent focus:ring-0 cursor-pointer ${maintenance.status === 'Completado' ? 'text-green-700 border-green-200 bg-green-50' :
                                            maintenance.status === 'En Proceso' ? 'text-blue-700 border-blue-200 bg-blue-50' :
                                                'text-yellow-700 border-yellow-200 bg-yellow-50'
                                            }`}
                                    >
                                        <option value="Programado">Programado</option>
                                        <option value="En Proceso">En Proceso</option>
                                        <option value="Completado">Completado</option>
                                    </select>
                                ) : (
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${maintenance.status === 'Completado' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                        {maintenance.status}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-foreground">{maintenance.type}</p>
                                            <p className="text-sm text-muted-foreground">{maintenance.description}</p>
                                        </div>
                                        <p className="text-lg font-bold text-foreground">{formatCurrency(maintenance.cost)}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border mt-2">
                                        <div>
                                            <p className="text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Fecha</p>
                                            <p className="font-medium text-foreground">{new Date(maintenance.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1 flex items-center gap-1"><Wrench className="h-3 w-3" /> Kilometraje</p>
                                            <p className="font-medium text-foreground">N/A km</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end pt-0 pb-4 pr-4">
                                {canEdit(currentUser) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => deleteMaintenance(maintenance.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            {maintenances.length === 0 && (
                <p className="text-muted-foreground text-center py-8 bg-card/30 rounded-lg border border-border">No hay mantenimientos registrados.</p>
            )}

            {/* Add Maintenance Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                            <CardTitle className="text-foreground">Registrar Mantenimiento</CardTitle>
                            <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <label className="text-sm text-foreground font-medium">Vehículo</label>
                                    <select
                                        value={formData.vehicleId}
                                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                        required
                                    >
                                        <option value="">Seleccionar Vehículo</option>
                                        {vehicles.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name} ({v.plate})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-foreground font-medium">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                        required
                                    >
                                        <option value="Preventivo">Preventivo</option>
                                        <option value="Correctivo">Correctivo</option>
                                        <option value="Lavado">Lavado</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-foreground font-medium">Costo ($)</label>
                                    <Input
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="bg-background border-input text-foreground mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-foreground font-medium">Fecha</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="bg-background border-input text-foreground mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-foreground font-medium">Descripción</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-md bg-background border border-input text-foreground mt-1 p-2 min-h-[80px]"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Guardar
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
