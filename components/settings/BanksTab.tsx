"use client";

import { useState } from "react";
import { useData, Bank } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Plus, X, Pencil, Trash2, Landmark } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";

export default function BanksTab() {
    const { banks, addBank, updateBank, deleteBank } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", code: "", active: true });
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean; title: string; description: string; onConfirm: () => void;
    }>({ isOpen: false, title: "", description: "", onConfirm: () => {} });

    const reset = () => { setForm({ name: "", code: "", active: true }); setEditingId(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
        try {
            if (editingId) {
                await updateBank(editingId, form);
                toast.success("Banco actualizado");
            } else {
                await addBank(form);
                toast.success("Banco creado");
            }
            setShowModal(false);
            reset();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar");
        }
    };

    const handleEdit = (bank: Bank) => {
        setForm({ name: bank.name, code: bank.code || "", active: bank.active });
        setEditingId(bank.id);
        setShowModal(true);
    };

    const handleDelete = (bank: Bank) => {
        setConfirmModal({
            isOpen: true,
            title: "Eliminar Banco",
            description: `¿Eliminar "${bank.name}"? No se puede eliminar si tiene cuentas asociadas.`,
            onConfirm: async () => {
                try {
                    await deleteBank(bank.id);
                    toast.success("Banco eliminado");
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
                    <h3 className="text-xl font-bold text-foreground">Bancos</h3>
                    <p className="text-sm text-muted-foreground">Entidades bancarias de la empresa.</p>
                </div>
                <Button onClick={() => { reset(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-1" /> Nuevo Banco
                </Button>
            </div>

            <div className="space-y-2">
                {banks.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <Landmark className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>No hay bancos configurados.</p>
                    </div>
                ) : banks.map(bank => (
                    <Card key={bank.id} className="border-border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Landmark className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{bank.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {bank.code && `Código: ${bank.code} · `}
                                        <span className={bank.active ? "text-green-600" : "text-red-500"}>
                                            {bank.active ? "Activo" : "Inactivo"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(bank)} className="text-muted-foreground hover:text-blue-600 transition-colors">
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(bank)} className="text-muted-foreground hover:text-red-600 transition-colors">
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
                                <h3 className="font-bold text-lg">{editingId ? "Editar Banco" : "Nuevo Banco"}</h3>
                                <button onClick={() => setShowModal(false)}><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Ecobank" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Código</label>
                                    <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="Código opcional" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="bankActive" checked={form.active}
                                        onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
                                    <label htmlFor="bankActive" className="text-sm">Activo</label>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
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
