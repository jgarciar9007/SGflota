"use client";

import { useState } from "react";
import { useData, Personnel } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Edit, Trash2, User, Phone, Car, Wallet, TrendingUp, LayoutGrid, List, Loader2, Eye } from "lucide-react";
import NomenclatureStatsModal from "./NomenclatureStatsModal";
import { toast } from "sonner";

export default function PersonnelTab() {
    const { personnel, addPersonnel, updatePersonnel, deletePersonnel } = useData();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [statsEntity, setStatsEntity] = useState<Personnel | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<Personnel, "id" | "salary"> & { salary: string | number }>({
        name: "",
        dni: "",
        phone: "",
        email: "",
        role: "Otro",
        status: "Activo",
        licenseNumber: "",
        salary: ""
    });

    const filteredPersonnel = personnel ? personnel.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dni.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount).replace("XAF", "FCFA");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Clean up data based on role
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanData: any = { ...formData };
        if (cleanData.role !== 'Conductor') {
            cleanData.licenseNumber = undefined;
            // Parse salary to number
            if (typeof cleanData.salary === 'string') {
                cleanData.salary = parseInt(cleanData.salary.replace(/\s/g, '')) || 0;
            }
        }
        if (cleanData.role === 'Conductor') {
            cleanData.salary = undefined;
        }

        try {
            if (editingId) {
                await updatePersonnel(editingId, cleanData);
                toast.success("Personal actualizado correctamente");
            } else {
                await addPersonnel(cleanData);
                toast.success("Personal creado correctamente");
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el personal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (person: Personnel) => {
        setFormData({
            name: person.name,
            dni: person.dni,
            phone: person.phone,
            email: person.email || "",
            role: person.role,
            status: person.status,
            licenseNumber: person.licenseNumber || "",
            salary: person.salary ? Math.round(person.salary).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""
        });
        setEditingId(person.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            dni: "",
            phone: "",
            email: "",
            role: "Otro",
            status: "Activo",
            licenseNumber: "",
            salary: ""
        });
        setEditingId(null);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${name}? Esta acción no se puede deshacer.`)) {
            try {
                await deletePersonnel(id);
                toast.success("Personal eliminado correctamente");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("Error deleting personnel:", error);
                toast.error(error.message || "Error al eliminar el personal");
            }
        }
    };

    const handleShowStats = (person: Personnel) => {
        setStatsEntity(person);
        setShowStats(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Personal y Conductores</h3>
                    <p className="text-sm text-muted-foreground">Gestiona los empleados y conductores de la flota.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Personal
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPersonnel.map((person) => (
                        <Card key={person.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${person.role === 'Conductor' ? 'bg-orange-100 border-orange-200' : 'bg-blue-100 border-blue-200'}`}>
                                            {person.role === 'Conductor' ? <Car className="h-5 w-5 text-orange-500" /> : <User className="h-5 w-5 text-blue-500" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{person.name}</h3>
                                            <div className="flex gap-2 text-xs">
                                                <span className="font-mono bg-muted px-1 rounded">{person.role}</span>
                                                <span className={`px-2 py-0.5 rounded-full border ${person.status === 'Activo'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'
                                                    }`}>
                                                    {person.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleShowStats(person)} className="h-8 w-8 text-muted-foreground hover:text-blue-600" title="Ver Estadísticas">
                                            <TrendingUp className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(person)} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Editar">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(person.id, person.name)} className="h-8 w-8 text-muted-foreground hover:text-red-600" title="Eliminar">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground border-t border-border pt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-xs uppercase text-muted-foreground w-6">DNI</span>
                                        <span>{person.dni}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <span>{person.phone || "-"}</span>
                                    </div>
                                    {person.role === 'Conductor' && person.licenseNumber && (
                                        <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-2 py-1 rounded">
                                            <span className="font-semibold text-xs">Licencia:</span>
                                            <span className="font-mono">{person.licenseNumber}</span>
                                        </div>
                                    )}
                                    {person.role !== 'Conductor' && person.salary && (
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded">
                                            <Wallet className="h-3 w-3" />
                                            <span className="font-mono font-semibold">{formatCurrency(person.salary)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border border-border bg-card overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase font-medium">
                            <tr>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Rol</th>
                                <th className="px-4 py-3">Contacto</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredPersonnel.map((person) => (
                                <tr key={person.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-foreground">{person.name}</div>
                                        <div className="text-xs text-muted-foreground">{person.dni}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`bg-muted px-2 py-1 rounded text-xs font-mono ${person.role === 'Conductor' ? 'text-orange-700 bg-orange-50' : 'text-blue-700 bg-blue-50'}`}>
                                            {person.role}
                                        </span>
                                        {person.role === 'Conductor' && person.licenseNumber && (
                                            <div className="text-xs text-muted-foreground mt-1">Lic: {person.licenseNumber}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-foreground">{person.email || "-"}</div>
                                        <div className="text-xs text-muted-foreground">{person.phone || "-"}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${person.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {person.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleShowStats(person)} className="p-1 hover:bg-muted rounded text-blue-600" title="Detalles">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleEdit(person)} className="p-1 hover:bg-muted rounded text-muted-foreground" title="Editar">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(person.id, person.name)} className="p-1 hover:bg-muted rounded text-red-600" title="Eliminar">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card shadow-lg animate-in zoom-in-95 duration-200">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-foreground">{editingId ? "Editar Personal" : "Nuevo Personal"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground">Nombre Completo</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-background border-input text-foreground"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground">DNI / NIF</label>
                                        <Input
                                            value={formData.dni}
                                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                            className="bg-background border-input text-foreground"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Rol</label>
                                        <select
                                            value={formData.role}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                            className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-purple-600"
                                        >
                                            <option value="Conductor">Conductor</option>
                                            <option value="Administrativo">Administrativo</option>
                                            <option value="Mecánico">Mecánico</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Teléfono</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-background border-input text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Email</label>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-background border-input text-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Conditional Fields */}
                                {formData.role === 'Conductor' ? (
                                    <div className="p-3 bg-orange-50 rounded-md border border-orange-100">
                                        <label className="text-sm font-medium text-orange-800">Número de Licencia</label>
                                        <Input
                                            value={formData.licenseNumber}
                                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                            className="bg-white border-orange-200 text-foreground mt-1"
                                            placeholder="Licencia de Conducción"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-green-50 rounded-md border border-green-100">
                                        <label className="text-sm font-medium text-green-800">Salario Base</label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={formData.salary}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                    setFormData({ ...formData, salary: formatted });
                                                }}
                                                className="bg-white border-green-200 text-foreground mt-1 pr-12"
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-[calc(50%-2px)] text-green-700 text-xs font-medium">FCFA</span>
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">Se usará para el cálculo de nómina</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-foreground">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "Activo" | "Inactivo" })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            editingId ? "Guardar Cambios" : "Crear Personal"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )
            }
            {
                showStats && statsEntity && (
                    <NomenclatureStatsModal
                        isOpen={showStats}
                        onClose={() => setShowStats(false)}
                        type="Personnel"
                        entity={statsEntity}
                    />
                )
            }
        </div >
    );
}
