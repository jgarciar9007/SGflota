"use client";

import { useState } from "react";
import { useData, Expense } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Search, Calendar, DollarSign, Tag, Trash2, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function GeneralExpensesTab() {
    const { expenses, addExpense, updateExpense, deleteExpense, expenseCategories } = useData();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
        status: "Pagado" as "Pagado" | "Pendiente",
    });

    const filteredExpenses = expenses.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expenseCategories.find(c => c.id === expense.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseData = {
            description: formData.description,
            amount: parseFloat(formData.amount.replace(/\s/g, '')),
            categoryId: formData.categoryId,
            date: formData.date,
            status: formData.status,
        };

        if (editingId) {
            updateExpense(editingId, expenseData);
        } else {
            addExpense(expenseData);
        }
        setShowModal(false);
        resetForm();
    };

    const handleEdit = (expense: Expense) => {
        setFormData({
            description: expense.description,
            amount: Math.round(expense.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
            categoryId: expense.categoryId,
            date: expense.date,
            status: expense.status,
        });
        setEditingId(expense.id);
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("¿Estás seguro de eliminar este gasto?")) {
            deleteExpense(id);
        }
    };

    const resetForm = () => {
        setFormData({
            description: "",
            amount: "",
            categoryId: "",
            date: new Date().toISOString().split("T")[0],
            status: "Pagado",
        });
        setEditingId(null);
    };

    // const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Gastos Generales</h3>
                    <p className="text-sm text-muted-foreground">Registra y controla los gastos operativos de la empresa.</p>
                </div>
                <div className="flex items-center gap-4">

                    <Button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Registrar Gasto
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="flex items-center gap-4 flex-1 w-full">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar gasto por descripción o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                    const category = expenseCategories.find(c => c.id === expense.categoryId);

                    return (
                        <Card key={expense.id} className="border-border bg-card hover:bg-accent/50 transition-colors shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                        <div className="flex items-center gap-3 md:col-span-2">
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                                                <DollarSign className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">{expense.description}</h3>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <p className="text-xs text-muted-foreground font-mono">{expense.expenseNumber || `#${expense.id.slice(0, 8)}`}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Tag className="h-3 w-3" />
                                                    {category?.name || "Sin Categoría"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground text-lg">{formatCurrency(expense.amount)}</span>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.status === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {expense.status}
                                            </span>
                                            <div className="flex items-center gap-1 ml-4 justify-end">
                                                <button onClick={() => handleEdit(expense)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(expense.id)} className="p-1 hover:bg-muted rounded text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {filteredExpenses.length === 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
                        <p className="text-muted-foreground">No se encontraron gastos registrados.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                            <CardTitle className="text-foreground">{editingId ? "Editar Gasto" : "Registrar Gasto"}</CardTitle>
                            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Descripción</label>
                                    <Input
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-background border-input text-foreground mt-1"
                                        placeholder="Ej. Compra de papelería"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Categoría</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                        required
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {expenseCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {expenseCategories.length === 0 && (
                                        <p className="text-xs text-yellow-600 mt-1">No hay categorías. Ve a Configuración para crearlas.</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground font-medium">Monto</label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={formData.amount}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                    setFormData({ ...formData, amount: formatted });
                                                }}
                                                className="bg-background border-input text-foreground mt-1 pr-8"
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-[calc(50%-2px)] text-muted-foreground text-xs font-medium">FCFA</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground font-medium">Fecha</label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "Pagado" | "Pendiente" })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                    >
                                        <option value="Pagado">Pagado</option>
                                        <option value="Pendiente">Pendiente de Pago</option>
                                    </select>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    {editingId ? "Guardar Cambios" : "Registrar Gasto"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
