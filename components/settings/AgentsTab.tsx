"use client";

import { useState } from "react";
import { useData, CommercialAgent } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Edit, Trash2, User, Phone, Mail, FileText, LayoutGrid, List, TrendingUp, Loader2, Eye } from "lucide-react";
import NomenclatureStatsModal from "./NomenclatureStatsModal";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AgentsTab() {
    const { commercialAgents, addCommercialAgent, updateCommercialAgent, deleteCommercialAgent, rentals } = useData();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showStats, setShowStats] = useState(false);
    const [statsEntity, setStatsEntity] = useState<CommercialAgent | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        dni: "",
        phone: "",
        email: "",
        status: "Activo" as "Activo" | "Inactivo",
    });

    const filteredAgents = commercialAgents ? commercialAgents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.dni.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    // Stats calculation moved to NomenclatureStatsModal

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateCommercialAgent(editingId, formData);
                toast.success("Agente actualizado correctamente");
            } else {
                await addCommercialAgent(formData);
                toast.success("Agente creado correctamente");
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving agent:", error);
            toast.error("Error al guardar el agente");
        } finally {
            setIsSubmitting(false);
        }
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

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de eliminar al agente comercial ${name}?`)) {
            try {
                await deleteCommercialAgent(id);
                toast.success("Agente eliminado correctamente");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("Error deleting agent:", error);
                toast.error(error.message || "Error al eliminar el agente");
            }
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

    const handleShowStats = (agent: CommercialAgent) => {
        setStatsEntity(agent);
        setShowStats(true);
    };

    const getAgentStats = (agentName: string) => {
        const agentRentals = rentals?.filter(r => r.commercialAgent === agentName) || [];
        const totalGenerated = agentRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        return { totalGenerated };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Agentes Comerciales</h3>
                    <p className="text-sm text-muted-foreground">Gestiona los vendedores y comisionistas.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Agente
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="flex items-center gap-4 flex-1 w-full">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                {/* View Toggle */}
                <div className="flex bg-muted rounded-md p-1">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-sm transition-colors ${viewMode === "grid" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-sm transition-colors ${viewMode === "list" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredAgents.map((agent) => {
                        return (
                            <Card key={agent.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                                                <User className="h-5 w-5 text-blue-400" />
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
                                            <Button variant="ghost" size="icon" onClick={() => handleShowStats(agent)} className="h-8 w-8 text-muted-foreground hover:text-blue-600" title="Ver Estadísticas">
                                                <TrendingUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(agent)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(agent.id, agent.name)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
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

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Ventas Totales</p>
                                            {/* Removed inline stats, use the modal */}
                                            <p className="font-bold text-foreground">Click ver estadísticas</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-md border border-border bg-card overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase font-medium">
                            <tr>
                                <th className="px-4 py-3">Agente</th>
                                <th className="px-4 py-3">Contacto</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Ventas</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredAgents.map((agent) => {
                                const stats = getAgentStats(agent.name);
                                return (
                                    <tr key={agent.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{agent.name}</div>
                                            <div className="text-xs text-muted-foreground">{agent.dni}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-muted-foreground">{agent.email}</div>
                                            <div className="text-xs text-muted-foreground">{agent.phone}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {agent.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-foreground">
                                            {formatCurrency(stats.totalGenerated)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleShowStats(agent)} className="p-1 hover:bg-muted rounded text-blue-600" title="Detalles">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleEdit(agent)} className="p-1 hover:bg-muted rounded text-muted-foreground" title="Editar">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(agent.id, agent.name)} className="p-1 hover:bg-muted rounded text-red-600" title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card shadow-lg">
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
                                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            editingId ? "Guardar Cambios" : "Crear Agente"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Replacement Stats Modal */}
            {showStats && statsEntity && (
                <NomenclatureStatsModal
                    isOpen={showStats}
                    onClose={() => setShowStats(false)}
                    type="Agent"
                    entity={statsEntity}
                />
            )}
        </div>
    );
}
