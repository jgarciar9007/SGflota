"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Calendar, Clock, Car, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function RentalsPage() {
    const { rentals, vehicles, clients, addRental, endRental, currentUser, canEdit, commercialAgents } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);

    const [formData, setFormData] = useState({
        vehicleId: "",
        clientId: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        commercialAgent: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const vehicle = vehicles.find((v) => v.id === formData.vehicleId);
        if (vehicle && formData.endDate) {
            try {
                await addRental({
                    ...formData,
                    dailyRate: vehicle.price,
                    status: "Activo",
                });
                setShowAddModal(false);
                setFormData({
                    vehicleId: "",
                    clientId: "",
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: "",
                    commercialAgent: ""
                });
                toast.success("Renta creada exitosamente");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                toast.error(error.message || "Error al crear la renta");
            }
        }
    };

    const initiateReturn = (rentalId: string) => {
        setSelectedRentalId(rentalId);
        setReturnDate(new Date().toISOString().split("T")[0]);
        setShowReturnModal(true);
    };

    const confirmReturn = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRentalId) {
            endRental(selectedRentalId, returnDate);
            setShowReturnModal(false);
            setSelectedRentalId(null);
        }
    };

    const activeRentals = rentals ? rentals.filter((r) => r && r.status === "Activo") : [];
    const completedRentals = rentals ? rentals.filter((r) => r && r.status === "Finalizado") : [];
    const availableVehicles = vehicles ? vehicles.filter((v) => v && v.status === "Disponible") : [];

    const resetForm = () => {
        setFormData({
            vehicleId: "",
            clientId: "",
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            commercialAgent: ""
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReturnClick = (rental: any) => {
        initiateReturn(rental.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Rentas</h2>
                    <p className="text-muted-foreground">Gestiona las rentas activas y el historial.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    disabled={availableVehicles.length === 0 || (clients && clients.length === 0)}
                >
                    <Plus className="mr-2 h-4 w-4" /> Nueva Renta
                </Button>
            </div>

            {/* Active Rentals */}
            <div>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    Rentas Activas ({activeRentals ? activeRentals.length : 0})
                </h3>
                <div className="space-y-3">
                    {activeRentals.map((rental) => {
                        const vehicle = vehicles.find((v) => v.id === rental.vehicleId);
                        const client = clients.find((c) => c.id === rental.clientId);
                        const days = Math.ceil(
                            (new Date().getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const currentTotal = days * rental.dailyRate;

                        return (
                            <Card key={rental.id} className="border-border bg-card hover:bg-accent/50 transition-colors shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center border border-blue-200">
                                                <Car className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-foreground">{vehicle?.name}</h3>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                                        {vehicle?.plate}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <User className="h-3 w-3" />
                                                    {client?.name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs text-muted-foreground">Inicio</p>
                                                <p className="font-medium text-foreground">{new Date(rental.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Días</p>
                                                <span className="text-foreground font-bold">{days}</span>
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <p className="text-xs text-muted-foreground">Total Acumulado</p>
                                                <p className="text-lg font-bold text-foreground">{formatCurrency(currentTotal)}</p>
                                            </div>
                                            {canEdit(currentUser) && (
                                                <Button
                                                    onClick={() => handleReturnClick(rental)}
                                                    variant="outline"
                                                    className="border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
                                                >
                                                    Finalizar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                {activeRentals.length === 0 && (
                    <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                        <p className="text-muted-foreground">No hay vehículos rentados actualmente.</p>
                    </div>
                )}
            </div>

            {/* Completed Rentals */}
            <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Historial de Rentas ({completedRentals.length})</h3>
                <div className="space-y-3">
                    {completedRentals.map((rental) => {
                        const vehicle = vehicles.find((v) => v.id === rental.vehicleId);
                        const client = clients.find((c) => c.id === rental.clientId);

                        return (
                            <Card key={rental.id} className="border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                            <div>
                                                <h3 className="font-bold text-foreground">{vehicle?.name}</h3>
                                                <p className="text-sm text-muted-foreground">{client?.name}</p>
                                                {rental.commercialAgent && <p className="text-xs text-primary">Agente: {rental.commercialAgent}</p>}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                {new Date(rental.startDate).toLocaleDateString()} - {rental.endDate && new Date(rental.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm">
                                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs border border-green-200">Completado</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="text-lg font-bold text-foreground">{formatCurrency(rental.totalAmount || 0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                {completedRentals.length === 0 && (
                    <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-lg border border-border border-dashed">No hay rentas completadas</p>
                )}
            </div>

            {/* Add Rental Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                            <CardTitle className="text-foreground">Nueva Renta</CardTitle>
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
                                        {availableVehicles.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name} ({v.plate}) - {formatCurrency(v.price)}/día
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-foreground font-medium">Cliente</label>
                                    <select
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                        required
                                    >
                                        <option value="">Seleccionar Cliente</option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-foreground font-medium">Agente Comercial (Opcional)</label>
                                    <select
                                        value={formData.commercialAgent || ""}
                                        onChange={(e) => setFormData({ ...formData, commercialAgent: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                    >
                                        <option value="">Ninguno</option>
                                        {commercialAgents.map((agent) => (
                                            <option key={agent.id} value={agent.name}>
                                                {agent.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Fecha Inicio</label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Fecha Fin (Estimada)</label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Crear Renta
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm border-border bg-card shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                            <CardTitle className="text-foreground">Finalizar Renta</CardTitle>
                            <button onClick={() => setShowReturnModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={confirmReturn}>
                            <CardContent className="space-y-4 pt-6">
                                <p className="text-sm text-muted-foreground">
                                    Confirma la fecha de devolución del vehículo.
                                </p>
                                <div>
                                    <label className="text-sm text-foreground font-medium">Fecha de Devolución</label>
                                    <Input
                                        type="date"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        className="bg-background border-input text-foreground mt-1"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border pt-6">
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    Confirmar Devolución
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
