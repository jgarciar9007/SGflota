"use client";

import { useState } from "react";
import { useData, Owner } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Edit, Trash2, User, Phone, Mail, FileText } from "lucide-react";

export default function OwnersPage() {
    const { owners, addOwner, updateOwner, deleteOwner } = useData();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        dni: "",
        phone: "",
        email: "",
        status: "Activo" as "Activo" | "Inactivo",
    });

    const filteredOwners = owners.filter(owner =>
        owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.dni.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateOwner(editingId, formData);
        } else {
            addOwner(formData);
        }
        setShowModal(false);
        resetForm();
    };

    const handleEdit = (owner: Owner) => {
        setFormData({
            name: owner.name,
            dni: owner.dni,
            phone: owner.phone,
            email: owner.email,
            status: owner.status,
        });
        setEditingId(owner.id);
        setShowModal(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`¿Estás seguro de eliminar al propietario ${name}?`)) {
            deleteOwner(id);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            dni: "",
            phone: "",
            email: "",
            status: "Activo",
        });
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Propietarios y Terceros</h2>
                    <p className="text-muted-foreground">Gestiona los propietarios de vehículos terceros.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }} // Changed setShowAddModal to setShowModal to match existing state
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Agregar Propietario
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o DNI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOwners.map((owner) => (
                    <Card key={owner.id} className="border-border bg-card hover:bg-accent/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{owner.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${owner.status === 'Activo'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                            {owner.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(owner)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(owner.id, owner.name)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span>{owner.dni}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{owner.phone || "Sin teléfono"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{owner.email || "Sin email"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Added the "No se encontraron propietarios" message */}
            {filteredOwners.length === 0 && (
                <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground text-lg">No se encontraron propietarios.</p>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-background">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-foreground">{editingId ? "Editar Propietario" : "Nuevo Propietario"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-foreground">Nombre Completo</label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-input border-border text-foreground"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="dni" className="text-sm font-medium text-foreground">DNI / NIF</label>
                                    <Input
                                        id="dni"
                                        value={formData.dni}
                                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                        className="bg-input border-border text-foreground"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-medium text-foreground">Teléfono</label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-input border-border text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-input border-border text-foreground"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="status" className="text-sm font-medium text-foreground">Estado</label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "Activo" | "Inactivo" })}
                                        className="w-full h-10 px-3 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="text-gray-300 hover:text-white hover:bg-gray-800">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                                        {editingId ? "Guardar Cambios" : "Crear Propietario"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
