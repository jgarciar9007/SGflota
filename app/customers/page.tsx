"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, Search, X, Mail, Phone, MapPin, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
    const { clients, addClient } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        dni: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addClient(formData);
        setShowAddModal(false);
        setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            dni: "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Clientes</h2>
                    <p className="text-gray-300">Gestiona la base de datos de clientes.</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre, email..."
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
                    {clients.map((client) => (
                        <Card key={client.id} className="border-gray-700 bg-gray-800/50 backdrop-blur hover:bg-gray-800/70 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">{client.name}</CardTitle>
                                <p className="text-sm text-gray-300 font-mono">{client.dni}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Mail className="h-4 w-4 text-blue-400" />
                                    {client.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Phone className="h-4 w-4 text-green-400" />
                                    {client.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <MapPin className="h-4 w-4 text-red-400" />
                                    {client.address}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-700 bg-gray-900/50 p-4">
                                <Link href={`/customers/${client.id}`} className="w-full">
                                    <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                                        Ver Historial
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {clients.map((client) => (
                        <Card key={client.id} className="border-gray-700 bg-gray-800/50 backdrop-blur hover:bg-gray-800/70 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <h3 className="font-bold text-white">{client.name}</h3>
                                            <p className="text-sm text-gray-300 font-mono">{client.dni}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <Mail className="h-4 w-4 text-blue-400" />
                                            {client.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <Phone className="h-4 w-4 text-green-400" />
                                            {client.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <MapPin className="h-4 w-4 text-red-400" />
                                            {client.address}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-gray-700 bg-gray-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
                            <CardTitle className="text-white">Agregar Cliente</CardTitle>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Nombre Completo</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">DNI/Pasaporte</label>
                                    <Input
                                        value={formData.dni}
                                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Teléfono</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Dirección</label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-700 pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Agregar Cliente
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
