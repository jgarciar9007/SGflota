"use client";

import { useState } from "react";
import { useData, ExpenseCategory } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, Tag, Save, X, LayoutGrid, List, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ExpenseCategoriesTab() {
    const { expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } = useData();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "Gasto" as "Gasto" | "Ingreso",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateExpenseCategory(editingId, formData);
                toast.success("Categoría actualizada correctamente");
            } else {
                await addExpenseCategory(formData);
                toast.success("Categoría creada correctamente");
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la categoría");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (category: ExpenseCategory) => {
        setFormData({
            name: category.name,
            description: category.description || "",
            type: category.type || "Gasto",
        });
        setEditingId(category.id);
        setShowModal(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de eliminar la categoría de gasto "${name}"?`)) {
            try {
                await deleteExpenseCategory(id);
                toast.success("Categoría eliminada correctamente");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("Error deleting category:", error);
                toast.error(error.message || "Error al eliminar la categoría");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            type: "Gasto",
        });
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Tipos de Gastos</h3>
                    <p className="text-sm text-muted-foreground">Define las categorías para clasificar los gastos de la empresa.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                </Button>
            </div>

            {/* View Toggle */}
            <div className="flex justify-end mb-4">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {expenseCategories.map((category) => (
                        <Card key={category.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200 mt-1">
                                            <Tag className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">{category.name}</h3>
                                            <div className="flex gap-2 text-xs mt-1">
                                                <span className={`px-2 py-0.5 rounded-full border ${category.type === 'Ingreso'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                    {category.type}
                                                </span>
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id, category.name)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
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
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Descripción</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {expenseCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                                                <Tag className="h-4 w-4 text-purple-400" />
                                            </div>
                                            <span className="font-medium text-foreground">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.type === 'Ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {category.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {category.description || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(category)} className="p-1 hover:bg-muted rounded text-muted-foreground" title="Editar">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(category.id, category.name)} className="p-1 hover:bg-muted rounded text-red-600" title="Eliminar">
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

            {expenseCategories.length === 0 && (
                <div className="text-center py-12 bg-muted/50 rounded-lg border border-border border-dashed">
                    <Tag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No hay categorías definidas</h3>
                    <p className="text-muted-foreground mb-6">Crea categorías para organizar mejor tus gastos.</p>
                    <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Crear Primera Categoría
                    </Button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card shadow-lg">
                        <CardHeader className="border-b border-border flex flex-row items-center justify-between">
                            <CardTitle className="text-foreground">{editingId ? "Editar Categoría" : "Nueva Categoría"}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-foreground">Nombre de la Categoría</label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-background border-input text-foreground"
                                        placeholder="Ej. Combustible, Oficina..."
                                        required
                                    />
                                    <div className="space-y-2">
                                        <label htmlFor="type" className="text-sm font-medium text-foreground">Tipo</label>
                                        <select
                                            id="type"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as "Gasto" | "Ingreso" })}
                                            className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        >
                                            <option value="Gasto">Gasto</option>
                                            <option value="Ingreso">Ingreso</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium text-foreground">Descripción (Opcional)</label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-background border-input text-foreground"
                                        placeholder="Breve descripción de los gastos..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        {editingId ? "Guardar Cambios" : "Crear Categoría"}
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
