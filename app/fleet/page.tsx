"use client";

import { useState } from "react";
import { useData, Vehicle } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { BadgeCheck, Battery, Fuel, Gauge, Plus, Search, X, Trash2, LayoutGrid, List, Upload, Loader2, BarChart2, Clock, Wrench, Calculator, TrendingUp, Car } from "lucide-react";
// import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export default function FleetPage() {
    const { vehicles, addVehicle, deleteVehicle, currentUser, canDelete, owners, rentals, maintenances } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVehicleStats, setSelectedVehicleStats] = useState<Vehicle | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        type: "Gasolina",
        range: "",
        price: "",
        plate: "",
        year: new Date().getFullYear(),
        image: "",
        ownership: "Propia",
        ownerName: "",
        ownerDni: ""
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('type', 'vehicle');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, image: data.url }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error al subir la imagen. Por favor intenta de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addVehicle({
            ...formData,
            price: parseFloat(formData.price),
            year: parseInt(formData.year.toString()),
            status: "Disponible",
            ownership: formData.ownership as "Propia" | "Tercero",
        });
        setShowAddModal(false);
        setFormData({
            name: "",
            type: "Gasolina",
            range: "",
            price: "",
            plate: "",
            year: new Date().getFullYear(),
            image: "",
            ownership: "Propia",
            ownerName: "",
            ownerDni: ""
        });
    };

    const filteredVehicles = vehicles.filter(car =>
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Flota de Vehículos</h2>
                    <p className="text-muted-foreground">Gestiona el inventario, estado y precios de la flota.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Agregar Vehículo
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                {/* Filters */}
                <div className="flex gap-4 items-center bg-card p-4 rounded-lg border border-border flex-1">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por marca, modelo o placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent"}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent"}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {viewMode === "grid" ? (
                // ... Grid View Logic (Keep existing) ...
                filteredVehicles.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredVehicles.map((car) => (
                            <Card key={car.id} className="overflow-hidden border-border bg-card hover:bg-accent transition-colors group">
                                <div className="aspect-video w-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                    <Image
                                        src={car.image}
                                        alt={car.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        unoptimized
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${car.status === 'Disponible' ? 'bg-green-600 text-white border-green-500' :
                                            car.status === 'Rentado' ? 'bg-blue-600 text-white border-blue-500' :
                                                'bg-yellow-600 text-white border-yellow-500'
                                            }`}>
                                            {car.status}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 left-4 z-20">
                                        {car.ownership === "Tercero" && (
                                            <span className="px-2 py-1 rounded bg-purple-600 text-white text-xs font-bold border border-purple-500 shadow-sm">
                                                {car.ownerName || "Tercero"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons Overlay */}
                                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                                        <button
                                            onClick={() => setSelectedVehicleStats(car)}
                                            className="p-2 rounded-full bg-blue-600/80 border-2 border-blue-400 text-white hover:bg-blue-600 transition-colors backdrop-blur-sm"
                                            title="Ver Estadísticas"
                                        >
                                            <BarChart2 className="h-4 w-4" />
                                        </button>

                                        {canDelete(currentUser) && (
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`¿Está seguro de eliminar el vehículo ${car.name}?`)) {
                                                        try {
                                                            await deleteVehicle(car.id);
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        } catch (error: any) {
                                                            alert(error.message);
                                                        }
                                                    }
                                                }}
                                                className="p-2 rounded-full bg-red-600/80 border-2 border-red-400 text-white hover:bg-red-600 transition-colors backdrop-blur-sm"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-xl text-foreground">{car.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{car.plate} • {car.year}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            {car.type === 'Eléctrico' ? <Battery className="h-4 w-4 text-green-400" /> : <Fuel className="h-4 w-4 text-orange-400" />}
                                            {car.type}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Gauge className="h-4 w-4 text-blue-400" />
                                            {car.range}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BadgeCheck className="h-4 w-4 text-purple-400" />
                                            {car.ownership === "Propia" ? "Flota Propia" : "Tercero"}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between border-t border-border bg-muted/30 p-4">
                                    <span className="text-lg font-bold text-foreground">{formatCurrency(car.price)}/día</span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => {
                                            setFormData({
                                                name: car.name,
                                                type: car.type,
                                                range: car.range || "",
                                                price: car.price.toString(),
                                                plate: car.plate,
                                                year: car.year,
                                                image: car.image || "",
                                                ownership: car.ownership,
                                                ownerName: car.ownerName || "",
                                                ownerDni: car.ownerDni || ""
                                            });
                                            setShowAddModal(true);
                                        }}>
                                            <BadgeCheck className="h-4 w-4 mr-2" /> Editar
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed border-border mx-auto max-w-2xl">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Car className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No hay vehículos registrados</h3>
                        <p className="text-muted-foreground mb-6">Comienza agregando tu primer vehículo a la flota.</p>
                        <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" /> Agregar Vehículo
                        </Button>
                    </div>
                )
            ) : (
                <div className="border border-border rounded-lg overflow-hidden bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Imagen</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehículo</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Tipo</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio/Día</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredVehicles.length > 0 ? filteredVehicles.map((car) => (
                                <tr key={car.id} className="hover:bg-accent/50 transition-colors">
                                    <td className="px-4 py-3 hidden md:table-cell w-20">
                                        <div className="h-10 w-16 relative rounded overflow-hidden">
                                            <Image src={car.image} alt={car.name} fill className="object-cover" unoptimized />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-foreground">{car.name}</div>
                                        <div className="text-xs text-muted-foreground">{car.plate} • {car.year}</div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            {car.type === 'Eléctrico' ? <Battery className="h-3 w-3 text-green-400" /> : <Fuel className="h-3 w-3 text-orange-400" />}
                                            {car.type}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${car.status === 'Disponible' ? 'bg-green-100 text-green-700 border-green-200' :
                                            car.status === 'Rentado' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {car.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-foreground">
                                        {formatCurrency(car.price)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedVehicleStats(car)}>
                                                <BarChart2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setFormData({
                                                    name: car.name,
                                                    type: car.type,
                                                    range: car.range || "",
                                                    price: car.price.toString(),
                                                    plate: car.plate,
                                                    year: car.year,
                                                    image: car.image || "",
                                                    ownership: car.ownership,
                                                    ownerName: car.ownerName || "",
                                                    ownerDni: car.ownerDni || ""
                                                });
                                                setShowAddModal(true);
                                            }}>
                                                <BadgeCheck className="h-4 w-4" />
                                            </Button>
                                            {canDelete(currentUser) && (
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={async () => {
                                                    if (confirm(`¿Está seguro de eliminar el vehículo ${car.name}?`)) {
                                                        try {
                                                            await deleteVehicle(car.id);
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        } catch (error: any) {
                                                            alert(error.message);
                                                        }
                                                    }
                                                }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No se encontraron vehículos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Vehicle Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-md border-border bg-card shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                                <CardTitle className="text-foreground">Agregar Vehículo</CardTitle>
                                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4 pt-6">
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Nombre del Vehículo</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Placa</label>
                                        <Input
                                            value={formData.plate}
                                            onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-foreground font-medium">Tipo</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                            >
                                                <option value="Gasolina">Gasolina</option>
                                                <option value="Eléctrico">Eléctrico</option>
                                                <option value="Híbrido">Híbrido</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-foreground font-medium">Año</label>
                                            <Input
                                                type="number"
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                                className="bg-background border-input text-foreground mt-1"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-foreground font-medium">Autonomía</label>
                                            <Input
                                                value={formData.range}
                                                onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                                                placeholder="500 km"
                                                className="bg-background border-input text-foreground mt-1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-foreground font-medium">Precio/día ($)</label>
                                            <Input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="bg-background border-input text-foreground mt-1"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Propiedad</label>
                                        <select
                                            value={formData.ownership}
                                            onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                                            className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1 mb-2"
                                        >
                                            <option value="Propia">Flota Propia de la Empresa</option>
                                            <option value="Tercero">Vehículo de Tercero (Alquiler Pasivo)</option>
                                        </select>
                                    </div>
                                    {formData.ownership === "Tercero" && (
                                        <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded border border-border">
                                            <div>
                                                <label className="text-sm text-foreground font-medium">Propietario</label>
                                                <select
                                                    value={formData.ownerName}
                                                    onChange={(e) => {
                                                        const selectedOwner = owners.find(o => o.name === e.target.value);
                                                        setFormData({
                                                            ...formData,
                                                            ownerName: e.target.value,
                                                            ownerDni: selectedOwner ? selectedOwner.dni : ""
                                                        });
                                                    }}
                                                    className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                                    required={formData.ownership === "Tercero"}
                                                >
                                                    <option value="">Seleccionar Propietario</option>
                                                    {owners.filter(o => o.status === 'Activo').map((owner) => (
                                                        <option key={owner.id} value={owner.name}>
                                                            {owner.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm text-foreground font-medium">DNI/Identificación</label>
                                                <Input
                                                    value={formData.ownerDni}
                                                    readOnly
                                                    className="bg-muted border-input text-muted-foreground mt-1 cursor-not-allowed"
                                                    placeholder="Se llena automáticamente"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Imagen del Vehículo</label>
                                        <div className="mt-2 space-y-2">
                                            {formData.image && (
                                                <Image
                                                    src={formData.image}
                                                    alt="Preview"
                                                    width={400}
                                                    height={128}
                                                    className="h-32 w-full object-cover rounded-lg"
                                                    unoptimized
                                                />
                                            )}
                                            <div className="flex gap-2">
                                                <label className="flex-1">
                                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
                                                        {uploading ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Subiendo...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="h-4 w-4" />
                                                                Subir desde PC
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                        disabled={uploading}
                                                    />
                                                </label>
                                            </div>
                                            <Input
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                placeholder="O ingresa la URL de la imagen"
                                                className="bg-background border-input text-foreground"
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-border pt-6">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        Agregar Vehículo
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                )}

            {/* Statistics Modal */}
            {selectedVehicleStats && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-3xl border-border bg-card shadow-lg max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border sticky top-0 bg-card z-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-16 relative rounded overflow-hidden">
                                    <Image src={selectedVehicleStats.image} alt={selectedVehicleStats.name} fill className="object-cover" unoptimized />
                                </div>
                                <div>
                                    <CardTitle className="text-foreground">Estadísticas: {selectedVehicleStats.name}</CardTitle>
                                    <p className="text-muted-foreground text-sm">{selectedVehicleStats.plate}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedVehicleStats(null)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {(() => {
                                    const vRentals = rentals.filter(r => r.vehicleId === selectedVehicleStats.id);
                                    const vMaintenances = maintenances.filter(m => m.vehicleId === selectedVehicleStats.id);

                                    const totalRevenue = vRentals.reduce((sum, r) => sum + (r.totalAmount || (r.dailyRate * Math.ceil((new Date(r.endDate || new Date()).getTime() - new Date(r.startDate).getTime()) / 86400000))), 0);
                                    const totalDays = vRentals.reduce((sum, r) => sum + Math.ceil((new Date(r.endDate || new Date()).getTime() - new Date(r.startDate).getTime()) / 86400000), 0);
                                    const totalMaintenanceCost = vMaintenances.reduce((sum, m) => sum + m.cost, 0);
                                    const maintenanceCount = vMaintenances.length;

                                    // Net Profit (Revenue - Maintenance - Owner Split if 3rd party)
                                    // Assuming 80% split for owner if 3rd party
                                    let netProfit = totalRevenue - totalMaintenanceCost;
                                    if (selectedVehicleStats.ownership === "Tercero") {
                                        netProfit = (totalRevenue * 0.20) - totalMaintenanceCost; // Enterprise keeps 20%
                                    }

                                    return (
                                        <>
                                            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800">
                                                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                                                    <Calculator className="h-4 w-4" />
                                                    <span className="font-semibold text-sm">Ingresos Totales</span>
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
                                            </div>
                                            <div className="p-4 bg-green-50/50 rounded-lg border border-green-100 dark:bg-green-900/10 dark:border-green-800">
                                                <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span className="font-semibold text-sm">Beneficio Neto</span>
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">{formatCurrency(netProfit)}</div>
                                                {selectedVehicleStats.ownership === "Tercero" && <div className="text-xs text-muted-foreground mt-1">(Despues de pago a dueño)</div>}
                                            </div>
                                            <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 dark:bg-purple-900/10 dark:border-purple-800">
                                                <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="font-semibold text-sm">Días Rentado</span>
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">{totalDays}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{vRentals.length} rentas total</div>
                                            </div>
                                            <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100 dark:bg-orange-900/10 dark:border-orange-800">
                                                <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
                                                    <Wrench className="h-4 w-4" />
                                                    <span className="font-semibold text-sm">Mantenimiento</span>
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">{formatCurrency(totalMaintenanceCost)}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{maintenanceCount} servicios</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Recent Activity Table */}
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-3">Historial Reciente</h3>
                                <div className="border border-border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha/Periodo</th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Monto</th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border bg-card">
                                            {(() => {
                                                const vRentals = rentals.filter(r => r.vehicleId === selectedVehicleStats.id).map(r => ({
                                                    type: 'Renta',
                                                    date: new Date(r.startDate),
                                                    displayDate: `${new Date(r.startDate).toLocaleDateString()} - ${new Date(r.endDate).toLocaleDateString()}`,
                                                    amount: r.totalAmount || 0, // Fallback needed
                                                    status: r.status,
                                                    id: r.id
                                                }));
                                                const vMaint = maintenances.filter(m => m.vehicleId === selectedVehicleStats.id).map(m => ({
                                                    type: 'Mantenimiento',
                                                    date: new Date(m.date),
                                                    displayDate: new Date(m.date).toLocaleDateString(),
                                                    amount: -m.cost,
                                                    status: m.status,
                                                    id: m.id
                                                }));

                                                const activity = [...vRentals, ...vMaint].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

                                                if (activity.length === 0) return <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Sin actividad reciente</td></tr>;

                                                return activity.map((item) => (
                                                    <tr key={item.id} className="hover:bg-accent/50">
                                                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                                                            {item.type === 'Renta' ? <span className="w-2 h-2 rounded-full bg-green-500" /> : <span className="w-2 h-2 rounded-full bg-orange-500" />}
                                                            {item.type}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">{item.displayDate}</td>
                                                        <td className={`px-4 py-3 text-right font-bold ${item.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatCurrency(Math.abs(item.amount))}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground border border-border">
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="border-t border-border bg-muted/30 p-4 flex justify-end">
                            <Button onClick={() => setSelectedVehicleStats(null)}>Cerrar</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}

