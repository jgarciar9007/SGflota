"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { BadgeCheck, Battery, Fuel, Gauge, Plus, Search, X, Trash2, LayoutGrid, List, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export default function FleetPage() {
    const { vehicles, addVehicle, deleteVehicle, currentUser, canDelete } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "Gasolina",
        range: "",
        price: "",
        plate: "",
        year: new Date().getFullYear(),
        image: "",
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
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Flota de Vehículos</h2>
                    <p className="text-gray-300">Gestiona el inventario de autos disponibles.</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Agregar Vehículo
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por modelo, marca..."
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-blue-600 text-white" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-blue-600 text-white" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {vehicles.map((car) => (
                        <Card key={car.id} className="overflow-hidden border-gray-700 bg-gray-800/50 backdrop-blur hover:bg-gray-800/70 transition-colors group">
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
                                {canDelete(currentUser) && (
                                    <button
                                        onClick={() => deleteVehicle(car.id)}
                                        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-red-600 border-2 border-red-500 text-white hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl text-white">{car.name}</CardTitle>
                                <p className="text-sm text-gray-300">{car.plate} • {car.year}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
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
                                        Premium
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between border-t border-gray-700 bg-gray-900/50 p-4">
                                <div className="text-lg font-bold text-white">{formatCurrency(car.price)}/día</div>
                                <Link href={`/fleet/${car.id}`}>
                                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                                        Ver Detalles
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {vehicles.map((car) => (
                        <Card key={car.id} className="border-gray-700 bg-gray-800/50 backdrop-blur hover:bg-gray-800/70 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={car.image}
                                        alt={car.name}
                                        width={96}
                                        height={64}
                                        className="w-24 h-16 object-cover rounded"
                                        unoptimized
                                    />
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                        <div>
                                            <h3 className="font-bold text-white">{car.name}</h3>
                                            <p className="text-sm text-gray-300">{car.plate} • {car.year}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            {car.type === 'Eléctrico' ? <Battery className="h-4 w-4 text-green-400" /> : <Fuel className="h-4 w-4 text-orange-400" />}
                                            {car.type}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <Gauge className="h-4 w-4 text-blue-400" />
                                            {car.range}
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${car.status === 'Disponible' ? 'bg-green-600 text-white border-green-500' :
                                                car.status === 'Rentado' ? 'bg-blue-600 text-white border-blue-500' :
                                                    'bg-yellow-600 text-white border-yellow-500'
                                                }`}>
                                                {car.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-lg font-bold text-white">{formatCurrency(car.price)}/día</span>
                                            {canDelete(currentUser) && (
                                                <button
                                                    onClick={() => deleteVehicle(car.id)}
                                                    className="p-2 rounded-full bg-red-600 border-2 border-red-500 text-white hover:bg-red-700 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Vehicle Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-gray-700 bg-gray-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
                            <CardTitle className="text-white">Agregar Vehículo</CardTitle>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Nombre del Vehículo</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Placa</label>
                                    <Input
                                        value={formData.plate}
                                        onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-300 font-medium">Tipo</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white mt-1"
                                        >
                                            <option value="Gasolina">Gasolina</option>
                                            <option value="Eléctrico">Eléctrico</option>
                                            <option value="Híbrido">Híbrido</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-300 font-medium">Año</label>
                                        <Input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="bg-gray-800 border-gray-700 text-white mt-1"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-300 font-medium">Autonomía</label>
                                        <Input
                                            value={formData.range}
                                            onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                                            placeholder="500 km"
                                            className="bg-gray-800 border-gray-700 text-white mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-300 font-medium">Precio/día ($)</label>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="bg-gray-800 border-gray-700 text-white mt-1"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Imagen del Vehículo</label>
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
                                            className="bg-gray-800 border-gray-700 text-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-700 pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Agregar Vehículo
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
