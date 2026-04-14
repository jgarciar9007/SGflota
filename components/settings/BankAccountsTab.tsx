"use client";

import { useState } from "react";
import { useData, BankAccount } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Plus, X, Pencil, Trash2, CreditCard } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function BankAccountsTab() {
    const { banks, bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        bankId: "", name: "", accountNumber: "",
        type: "Corriente" as "Corriente" | "Ahorros",
        openingBalance: "", active: true,
    });
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean; title: string; description: string; onConfirm: () => void;
    }>({ isOpen: false, title: "", description: "", onConfirm: () => {} });

    const reset = () => {
        setForm({ bankId: "", name: "", accountNumber: "", type: "Corriente", openingBalance: "", active: true });
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.bankId || !form.name.trim()) { toast.error("Banco y nombre son obligatorios"); return; }
        try {
            if (editingId) {
                await updateBankAccount(editingId, {
                    name: form.name,
                    accountNumber: form.accountNumber || undefined,
                    type: form.type,
                    active: form.active,
                });
                toast.success("Cuenta actualizada");
            } else {
                await addBankAccount({
                    bankId: form.bankId,
                    name: form.name,
                    accountNumber: form.accountNumber || undefined,
                    type: form.type,
                    openingBalance: parseInt(form.openingBalance.replace(/\s/g, "") || "0", 10),
                    currentBalance: parseInt(form.openingBalance.replace(/\s/g, "") || "0", 10),
                    active: form.active,
                });
                toast.success("Cuenta creada");
            }
            setShowModal(false);
            reset();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar");
        }
    };

    const handleEdit = (acc: BankAccount) => {
        setForm({
            bankId: acc.bankId,
            name: acc.name,
            accountNumber: acc.accountNumber || "",
            type: acc.type,
            openingBalance: acc.openingBalance.toString(),
            active: acc.active,
        });
        setEditingId(acc.id);
        setShowModal(true);
    };

    const handleDelete = (acc: BankAccount) => {
        setConfirmModal({
            isOpen: true,
            title: "Eliminar Cuenta",
            description: `¿Eliminar "${acc.name}"? No se puede eliminar si tiene movimientos registrados.`,
            onConfirm: async () => {
                try {
                    await deleteBankAccount(acc.id);
                    toast.success("Cuenta eliminada");
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
                    <h3 className="text-xl font-bold text-foreground">Cuentas Bancarias</h3>
                    <p className="text-sm text-muted-foreground">Cuentas asociadas a los bancos de la empresa.</p>
                </div>
                <Button onClick={() => { reset(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={banks.length === 0}>
                    <Plus className="h-4 w-4 mr-1" /> Nueva Cuenta
                </Button>
            </div>

            {banks.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
                    Primero debes crear al menos un banco en la pestaña "Bancos".
                </p>
            )}

            <div className="space-y-2">
                {bankAccounts.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>No hay cuentas bancarias configuradas.</p>
                    </div>
                ) : bankAccounts.map(acc => {
                    const bank = banks.find(b => b.id === acc.bankId);
                    return (
                        <Card key={acc.id} className="border-border">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{acc.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {bank?.name} · {acc.type}
                                            {acc.accountNumber && ` · ${acc.accountNumber}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Apertura: {formatCurrency(acc.openingBalance)} ·{" "}
                                            <span className="font-semibold text-blue-700">Saldo actual: {formatCurrency(acc.currentBalance)}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${acc.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {acc.active ? "Activa" : "Inactiva"}
                                    </span>
                                    <button onClick={() => handleEdit(acc)} className="text-muted-foreground hover:text-blue-600 transition-colors">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(acc)} className="text-muted-foreground hover:text-red-600 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">{editingId ? "Editar Cuenta" : "Nueva Cuenta Bancaria"}</h3>
                                <button onClick={() => setShowModal(false)}><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Banco *</label>
                                    <select value={form.bankId} onChange={e => setForm(p => ({ ...p, bankId: e.target.value }))}
                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm"
                                        required disabled={!!editingId}>
                                        <option value="">Seleccionar banco</option>
                                        {banks.filter(b => b.active).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre descriptivo *</label>
                                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        placeholder="Ej: Cuenta Operativa Principal" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Número de cuenta / IBAN</label>
                                    <Input value={form.accountNumber} onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))}
                                        placeholder="Número de cuenta (opcional)" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo</label>
                                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as "Corriente" | "Ahorros" }))}
                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm">
                                        <option value="Corriente">Corriente</option>
                                        <option value="Ahorros">Ahorros</option>
                                    </select>
                                </div>
                                {!editingId && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Saldo de apertura</label>
                                        <Input value={form.openingBalance} onChange={e => setForm(p => ({ ...p, openingBalance: e.target.value }))}
                                            placeholder="0" type="number" min="0" />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="accActive" checked={form.active}
                                        onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
                                    <label htmlFor="accActive" className="text-sm">Activa</label>
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
