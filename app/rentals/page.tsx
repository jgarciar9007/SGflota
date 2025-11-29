"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function RentalsPage() {
    const { rentals, vehicles, clients, addRental, endRental, currentUser, canEdit } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        vehicleId: "",
        clientId: "",
        startDate: new Date().toISOString().split("T")[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const vehicle = vehicles.find((v) => v.id === formData.vehicleId);
        if (vehicle) {
            addRental({
                ...formData,
                endDate: null,
                dailyRate: vehicle.price,
                status: "Activo",
            });
            setShowAddModal(false);
            setFormData({
                vehicleId: "",
                clientId: "",
                startDate: new Date().toISOString().split("T")[0],
            });
        }
    };

    const handleReturn = (rentalId: string) => {
        const endDate = new Date().toISOString().split("T")[0];
        endRental(rentalId, endDate);
    };

    const activeRentals = rentals.filter((r) => r.status === "Activo");
    const completedRentals = rentals.filter((r) => r.status === "Finalizado");
    const availableVehicles = vehicles.filter((v) => v.status === "Disponible");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Rentas</h2>
                    <p className="text-gray-300">Gestiona las rentas activas y el historial.</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    disabled={availableVehicles.length === 0 || clients.length === 0}
                >
                    <Plus className="mr-2 h-4 w-4" /> Nueva Renta
                </Button>
            </div>

            {/* Active Rentals */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Rentas Activas ({activeRentals.length})
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
                            <Card key={rental.id} className="border-gray-700 bg-gray-800/50 backdrop-blur">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                            <div>
                                                <h3 className="font-bold text-white">{vehicle?.name}</h3>
                                                <p className="text-sm text-gray-300">{client?.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <Calendar className="h-4 w-4 text-blue-400" />
                                                {new Date(rental.startDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <DollarSign className="h-4 w-4 text-green-400" />
                                                {formatCurrency(rental.dailyRate)}/día
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-white font-bold">{days}</span>
                                                <span className="text-gray-300"> días</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-3">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400">Total actual</p>
                                                    <p className="text-lg font-bold text-white">{formatCurrency(currentTotal)}</p>
                                                </div>
                                                {canEdit(currentUser) && (
                                                    <Button
                                                        onClick={() => handleReturn(rental.id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        Devolver
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
                {activeRentals.length === 0 && (
                    <p className="text-gray-400 text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700">No hay rentas activas</p>
                )}
            </div>

            {/* Completed Rentals */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Historial de Rentas ({completedRentals.length})</h3>
                <div className="space-y-3">
                    {completedRentals.map((rental) => {
                        const vehicle = vehicles.find((v) => v.id === rental.vehicleId);
                        const client = clients.find((c) => c.id === rental.clientId);

                        return (
                            <Card key={rental.id} className="border-gray-700 bg-gray-800/30 backdrop-blur opacity-75">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                            <div>
                                                <h3 className="font-bold text-white">{vehicle?.name}</h3>
                                                <p className="text-sm text-gray-300">{client?.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <Calendar className="h-4 w-4 text-blue-400" />
                                                {new Date(rental.startDate).toLocaleDateString()} - {rental.endDate && new Date(rental.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                <span className="px-2 py-1 rounded-full bg-gray-700 text-xs">Completado</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Total</p>
                                                <p className="text-lg font-bold text-white">{formatCurrency(rental.totalAmount || 0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                {completedRentals.length === 0 && (
                    <p className="text-gray-400 text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700">No hay rentas completadas</p>
                )}
            </div>

            {/* Add Rental Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-gray-700 bg-gray-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
                            <CardTitle className="text-white">Nueva Renta</CardTitle>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Cliente</label>
                                    <select
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white mt-1"
                                        required
                                    >
                                        <option value="">Seleccionar cliente</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                                {vehicle.name} - {formatCurrency(vehicle.price)}/día
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Fecha de Inicio</label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-700 pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Crear Renta
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
