"use client";

import { useState } from "react";
import { useData, PettyCash } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Plus, X, Pencil, Trash2, Wallet } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function PettyCashTab() {
    const { pettyCashes, addPettyCash, updatePettyCash, deletePettyCash } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", openingBalance: "", active: true });
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean; title: string; description: string; onConfirm: () => void;
    }>({ isOpen: false, title: "", description: "", onConfirm: () => {} });

    const reset = () => { setForm({ name: "", openingBalance: "", active: true }); setEditingId(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
        try {
            if (editingId) {
                await updatePettyCash(editingId, { name: form.name, active: form.active });
                toast.success("Caja actualizada");
            } else {
                const balance = parseInt(form.openingBalance.replace(/\s/g, "") || "0", 10);
                await addPettyCash({ name: form.name, openingBalance: balance, currentBalance: balance, active: form.active });
                toast.success("Caja creada");
            }
            setShowModal(false);
            reset();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar");
        }
    };

    const handleEdit = (pc: PettyCash) => {
        setForm({ name: pc.name, openingBalance: pc.openingBalance.toString(), active: pc.active });
        setEditingId(pc.id);
        setShowModal(true);
    };

    const handleDelete = (pc: PettyCash) => {
        setConfirmModal({
            isOpen: true,
            title: "Eliminar Caja",
            description: `¿Eliminar "${pc.name}"? No se puede eliminar si tiene movimientos registrados.`,
            onConfirm: async () => {
                try {
                    await deletePettyCash(pc.id);
                    toast.success("Caja eliminada");
                } catch (err: any) {
                    toast.error(err.message || "Error al eliminar");
                }
                setConfirmModal(p => ({ ...p, isOpen: false }));
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Cajas Chicas</h3>
                    <p className="text-sm text-muted-foreground">Cajas de efectivo físico de la empresa.</p>
                </div>
                <Button onClick={() => { reset(); setShowModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="h-4 w-4 mr-1" /> Nueva Caja
                </Button>
            </div>

            <div className="space-y-2">
                {pettyCashes.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>No hay cajas chicas configuradas.</p>
                    </div>
                ) : pettyCashes.map(pc => (
                    <Card key={pc.id} className="border-border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{pc.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Apertura: {formatCurrency(pc.openingBalance)} ·{" "}
                                        <span className="font-semibold text-emerald-700">Saldo actual: {formatCurrency(pc.currentBalance)}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${pc.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {pc.active ? "Activa" : "Inactiva"}
                                </span>
                                <button onClick={() => handleEdit(pc)} className="text-muted-foreground hover:text-blue-600 transition-colors">
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(pc)} className="text-muted-foreground hover:text-red-600 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">{editingId ? "Editar Caja" : "Nueva Caja Chica"}</h3>
                                <button onClick={() => setShowModal(false)}><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        placeholder="Ej: Caja Principal Oficina" required />
                                </div>
                                {!editingId && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Saldo de apertura</label>
                                        <Input value={form.openingBalance} onChange={e => setForm(p => ({ ...p, openingBalance: e.target.value }))}
                                            placeholder="0" type="number" min="0" />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="pcActive" checked={form.active}
                                        onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
                                    <label htmlFor="pcActive" className="text-sm">Activa</label>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        {editingId ? "Actualizar" : "Crear"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                description={confirmModal.description}
                variant="danger"
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
            />
        </div>
    );
}
