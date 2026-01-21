"use client";

import { useState } from "react";
import { useData, CommercialAgent } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Edit, Trash2, User, Phone, Mail, FileText } from "lucide-react";

export default function AgentsPage() {
    const { commercialAgents, addCommercialAgent, updateCommercialAgent, deleteCommercialAgent } = useData();
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

    const filteredAgents = commercialAgents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.dni.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateCommercialAgent(editingId, formData);
        } else {
            addCommercialAgent(formData);
        }
        setShowModal(false);
        resetForm();
    };

    const handleEdit = (agent: CommercialAgent) => {
        setFormData({
            name: agent.name,
            dni: agent.dni,
            phone: agent.phone,
            email: agent.email,
            status: agent.status,
        });
        setEditingId(agent.id);
        setShowModal(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`¿Estás seguro de eliminar al agente comercial ${name}?`)) {
            deleteCommercialAgent(id);
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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Agentes Comerciales</h2>
                    <p className="text-muted-foreground">Gestiona los vendedores y comisionistas.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Agente
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
                {filteredAgents.map((agent) => (
                    <Card key={agent.id} className="border-border bg-card hover:bg-accent/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{agent.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${agent.status === 'Activo'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                            {agent.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(agent)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(agent.id, agent.name)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span>{agent.dni}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{agent.phone || "Sin teléfono"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{agent.email || "Sin email"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-foreground">{editingId ? "Editar Agente" : "Nuevo Agente Comercial"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-foreground">Nombre Completo</label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-background border-input text-foreground"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="dni" className="text-sm font-medium text-foreground">DNI / NIF</label>
                                    <Input
                                        id="dni"
                                        value={formData.dni}
                                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                        className="bg-background border-input text-foreground"
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
                                            className="bg-background border-input text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-background border-input text-foreground"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="status" className="text-sm font-medium text-foreground">Estado</label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "Activo" | "Inactivo" })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground hover:bg-accent">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {editingId ? "Guardar Cambios" : "Crear Agente"}
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
