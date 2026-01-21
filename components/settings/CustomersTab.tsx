
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, Search, X, Mail, Phone, MapPin, LayoutGrid, List, Users, TrendingUp, Trash2, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import NomenclatureStatsModal from "./NomenclatureStatsModal";
import { Client } from "@/context/DataContext";
import { toast } from "sonner";

export default function CustomersTab() {
    const { clients, addClient, deleteClient, updateClient } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showStats, setShowStats] = useState(false);
    const [statsEntity, setStatsEntity] = useState<Client | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        dni: "",
    });

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateClient(editingId, formData);
                toast.success("Cliente actualizado correctamente");
            } else {
                await addClient(formData);
                toast.success("Cliente registrado correctamente");
            }
            setShowAddModal(false);
            resetForm();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al guardar el cliente");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el cliente ${name}?`)) {
            try {
                await deleteClient(id);
                toast.success("Cliente eliminado correctamente");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error(error);
                // The API returns distinct error messages for dependencies, show them.
                toast.error(error.message || "No se pudo eliminar el cliente");
            }
        }
    };

    const handleEdit = (client: Client) => {
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            dni: client.dni,
        });
        setEditingId(client.id);
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            dni: "",
        });
        setEditingId(null);
    };

    const handleShowStats = (client: Client) => {
        setStatsEntity(client);
        setShowStats(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle className="text-foreground flex items-center gap-2 text-xl">
                        <Users className="h-5 w-5 text-blue-400" />
                        Gestión de Clientes
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona la base de datos de clientes.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                    <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, email..."
                        className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-blue-600 text-white" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-blue-600 text-white" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="border-border bg-card hover:bg-accent/50 transition-colors shadow-sm flex flex-col justify-between">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl text-foreground">{client.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground font-mono">{client.dni}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id, client.name)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 text-blue-500" />
                                    {client.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 text-green-500" />
                                    {client.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    {client.address}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border bg-muted/50 p-4 flex flex-col gap-2">
                                <Link href={`/customers/${client.id}`} className="w-full">
                                    <Button variant="ghost" className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                        Ver Historial
                                    </Button>
                                </Link>
                                <Button variant="ghost" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 mt-2" onClick={() => handleShowStats(client)}>
                                    <TrendingUp className="mr-2 h-4 w-4" /> Estadísticas
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="border-border bg-card hover:bg-accent/50 transition-colors shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <h3 className="font-bold text-foreground">{client.name}</h3>
                                            <p className="text-sm text-muted-foreground font-mono">{client.dni}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4 text-blue-400" />
                                            {client.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4 text-green-400" />
                                            {client.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 text-red-400" />
                                            {client.address}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/customers/${client.id}`}>
                                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                                                Ver
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleShowStats(client)}>
                                            <TrendingUp className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id, client.name)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-md border-border bg-card shadow-lg animate-in fade-in zoom-in duration-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                                <CardTitle className="text-foreground">{editingId ? "Editar Cliente" : "Agregar Cliente"}</CardTitle>
                                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4 pt-6">
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Nombre Completo</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-foreground font-medium">DNI/Pasaporte</label>
                                        <Input
                                            value={formData.dni}
                                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Email</label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Teléfono</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-foreground font-medium">Dirección</label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-border pt-6 gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="w-full text-muted-foreground hover:text-foreground">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            editingId ? "Guardar Cambios" : "Agregar Cliente"
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                )
            }

            {
                showStats && statsEntity && (
                    <NomenclatureStatsModal
                        isOpen={showStats}
                        onClose={() => setShowStats(false)}
                        type="Client"
                        entity={statsEntity}
                    />
                )
            }
        </div >
    );
}
