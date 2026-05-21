"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Landmark, Wallet, TrendingUp, TrendingDown, Plus, Trash2,
    ArrowLeftRight, Building2, X, Filter, Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

type TabId = "resumen" | "bancos" | "caja" | "transferencias";

export default function BankCashPage() {
    const {
        banks, bankAccounts, pettyCashes,
        bankTransactions, cashTransactions, transfers,
        addBankTransaction, deleteBankTransaction,
        addCashTransaction, deleteCashTransaction,
        addTransfer,
        currentUser, canEdit, canDelete,
    } = useData();

    const [activeTab, setActiveTab] = useState<TabId>("resumen");
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean; title: string; description: string;
        onConfirm: () => void; variant?: "danger" | "info";
    }>({ isOpen: false, title: "", description: "", onConfirm: () => {} });

    // ── Resumen ─────────────────────────────────────────────────────
    const activeBankAccounts = bankAccounts.filter(a => a.active);
    const activePettyCashes = pettyCashes.filter(p => p.active);
    const activePettyCashIds = new Set(activePettyCashes.map(p => p.id));
    const getPettyCashNetBalance = (pettyCashId: string) => cashTransactions
        .filter(tx => tx.pettyCashId === pettyCashId)
        .reduce((s, tx) => s + (tx.type === "Ingreso" ? tx.amount : -tx.amount), 0);
    const totalBancos = activeBankAccounts.reduce((s, a) => s + a.currentBalance, 0);
    const totalCaja = cashTransactions
        .filter(tx => activePettyCashIds.has(tx.pettyCashId))
        .reduce((s, tx) => s + (tx.type === "Ingreso" ? tx.amount : -tx.amount), 0);
    const posicionTotal = totalBancos + totalCaja;

    // ── Movimientos Bancarios filters ────────────────────────────────
    const [bkFilterAccount, setBkFilterAccount] = useState("");
    const [bkFilterType, setBkFilterType] = useState("");
    const [bkFilterStart, setBkFilterStart] = useState("");
    const [bkFilterEnd, setBkFilterEnd] = useState("");

    const filteredBkTx = bankTransactions.filter(tx => {
        if (bkFilterAccount && tx.bankAccountId !== bkFilterAccount) return false;
        if (bkFilterType && tx.type !== bkFilterType) return false;
        if (bkFilterStart && new Date(tx.date) < new Date(bkFilterStart)) return false;
        if (bkFilterEnd && new Date(tx.date) > new Date(bkFilterEnd + "T23:59:59")) return false;
        return true;
    });

    const bkEntradas = filteredBkTx.filter(t => t.type === "Deposito" || (t.type === "Transferencia" && t.description.startsWith("Transferencia entrante"))).reduce((s, t) => s + t.amount, 0);
    const bkSalidas = filteredBkTx.filter(t => t.type === "Retiro" || (t.type === "Transferencia" && t.description.startsWith("Transferencia saliente"))).reduce((s, t) => s + t.amount, 0);

    // ── Movimientos Caja filters ─────────────────────────────────────
    const [cjFilterBox, setCjFilterBox] = useState("");
    const [cjFilterType, setCjFilterType] = useState("");
    const [cjFilterStart, setCjFilterStart] = useState("");
    const [cjFilterEnd, setCjFilterEnd] = useState("");

    const filteredCjTx = cashTransactions.filter(tx => {
        if (cjFilterBox && tx.pettyCashId !== cjFilterBox) return false;
        if (cjFilterType && tx.type !== cjFilterType) return false;
        if (cjFilterStart && new Date(tx.date) < new Date(cjFilterStart)) return false;
        if (cjFilterEnd && new Date(tx.date) > new Date(cjFilterEnd + "T23:59:59")) return false;
        return true;
    });

    const cjIngresos = filteredCjTx.filter(t => t.type === "Ingreso").reduce((s, t) => s + t.amount, 0);
    const cjEgresos = filteredCjTx.filter(t => t.type === "Egreso").reduce((s, t) => s + t.amount, 0);

    // ── Nuevo Movimiento Bancario ────────────────────────────────────
    const [showBkModal, setShowBkModal] = useState(false);
    const [bkForm, setBkForm] = useState({
        bankAccountId: "", type: "Deposito" as "Deposito" | "Retiro",
        amount: "", date: new Date().toISOString().split("T")[0],
        description: "", reference: "",
    });
    const [bkSubmitting, setBkSubmitting] = useState(false);

    const handleBkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(bkForm.amount.replace(/\s/g, ""), 10);
        if (!bkForm.bankAccountId || isNaN(amount) || amount <= 0) {
            toast.error("Completa todos los campos obligatorios");
            return;
        }
        setBkSubmitting(true);
        try {
            await addBankTransaction({
                bankAccountId: bkForm.bankAccountId,
                type: bkForm.type,
                amount,
                date: bkForm.date,
                description: bkForm.description,
                reference: bkForm.reference || undefined,
            });
            toast.success("Movimiento registrado");
            setShowBkModal(false);
            setBkForm({ bankAccountId: "", type: "Deposito", amount: "", date: new Date().toISOString().split("T")[0], description: "", reference: "" });
        } catch (err: any) {
            toast.error(err.message || "Error al registrar");
        } finally {
            setBkSubmitting(false);
        }
    };

    // ── Nuevo Movimiento Caja ────────────────────────────────────────
    const [showCjModal, setShowCjModal] = useState(false);
    const [cjForm, setCjForm] = useState({
        pettyCashId: "", type: "Ingreso" as "Ingreso" | "Egreso",
        category: "Otro", amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "", reference: "",
    });
    const [cjSubmitting, setCjSubmitting] = useState(false);

    const handleCjSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(cjForm.amount.replace(/\s/g, ""), 10);
        if (!cjForm.pettyCashId || isNaN(amount) || amount <= 0) {
            toast.error("Completa todos los campos obligatorios");
            return;
        }
        setCjSubmitting(true);
        try {
            await addCashTransaction({
                pettyCashId: cjForm.pettyCashId,
                type: cjForm.type,
                category: cjForm.category,
                amount,
                date: cjForm.date,
                description: cjForm.description,
                reference: cjForm.reference || undefined,
            });
            toast.success("Movimiento registrado");
            setShowCjModal(false);
            setCjForm({ pettyCashId: "", type: "Ingreso", category: "Otro", amount: "", date: new Date().toISOString().split("T")[0], description: "", reference: "" });
        } catch (err: any) {
            toast.error(err.message || "Error al registrar");
        } finally {
            setCjSubmitting(false);
        }
    };

    // ── Nueva Transferencia ──────────────────────────────────────────
    const [trfForm, setTrfForm] = useState({
        type: "BancoABanco" as "BancoABanco" | "CajaABanco" | "BancoACaja",
        sourceBankAccountId: "", destBankAccountId: "", pettyCashId: "",
        amount: "", date: new Date().toISOString().split("T")[0], description: "",
    });
    const [trfSubmitting, setTrfSubmitting] = useState(false);

    const handleTrfSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(trfForm.amount.replace(/\s/g, ""), 10);
        if (isNaN(amount) || amount <= 0 || !trfForm.description) {
            toast.error("Completa todos los campos");
            return;
        }
        if (trfForm.type === "BancoABanco" && (!trfForm.sourceBankAccountId || !trfForm.destBankAccountId)) {
            toast.error("Selecciona cuentas origen y destino");
            return;
        }
        if (trfForm.type === "CajaABanco" && (!trfForm.pettyCashId || !trfForm.destBankAccountId)) {
            toast.error("Selecciona caja origen y cuenta destino");
            return;
        }
        if (trfForm.type === "BancoACaja" && (!trfForm.sourceBankAccountId || !trfForm.pettyCashId)) {
            toast.error("Selecciona cuenta bancaria origen y caja destino");
            return;
        }
        setTrfSubmitting(true);
        try {
            await addTransfer({
                type: trfForm.type,
                amount,
                date: trfForm.date,
                description: trfForm.description,
                sourceBankAccountId: (trfForm.type === "BancoABanco" || trfForm.type === "BancoACaja") ? trfForm.sourceBankAccountId : undefined,
                destBankAccountId: (trfForm.type === "BancoABanco" || trfForm.type === "CajaABanco") ? trfForm.destBankAccountId : undefined,
                pettyCashId: (trfForm.type === "CajaABanco" || trfForm.type === "BancoACaja") ? trfForm.pettyCashId : undefined,
            });
            toast.success("Transferencia registrada");
            setTrfForm({ type: "BancoABanco", sourceBankAccountId: "", destBankAccountId: "", pettyCashId: "", amount: "", date: new Date().toISOString().split("T")[0], description: "" });
        } catch (err: any) {
            toast.error(err.message || "Error al registrar");
        } finally {
            setTrfSubmitting(false);
        }
    };

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: "resumen", label: "Resumen", icon: TrendingUp },
        { id: "bancos", label: "Cuentas Bancarias", icon: Landmark },
        { id: "caja", label: "Caja Chica", icon: Wallet },
        { id: "transferencias", label: "Transferencias", icon: ArrowLeftRight },
    ];

    return (
        <div className="space-y-6 p-1">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Banco y Efectivo</h2>
                <p className="text-muted-foreground">Control de saldos, movimientos y transferencias.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════════════ RESUMEN ══════════════════ */}
            {activeTab === "resumen" && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="ring-1 ring-blue-100 bg-blue-50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Landmark className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-blue-700">Total en Bancos</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalBancos)}</p>
                            </CardContent>
                        </Card>
                        <Card className="ring-1 ring-emerald-100 bg-emerald-50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Wallet className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-medium text-emerald-700">Total Caja Chica</span>
                                </div>
                                <p className="text-2xl font-bold text-emerald-800">{formatCurrency(totalCaja)}</p>
                            </CardContent>
                        </Card>
                        <Card className="ring-1 ring-indigo-100 bg-indigo-50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <span className="text-sm font-medium text-indigo-700">Posición Total</span>
                                </div>
                                <p className="text-2xl font-bold text-indigo-800">{formatCurrency(posicionTotal)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cuentas Bancarias */}
                    {activeBankAccounts.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cuentas Bancarias</h3>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {activeBankAccounts.map(acc => {
                                    const bank = banks.find(b => b.id === acc.bankId);
                                    return (
                                        <Card key={acc.id} className="border-border">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold text-foreground">{acc.name}</p>
                                                        <p className="text-xs text-muted-foreground">{bank?.name} · {acc.type}</p>
                                                        {acc.accountNumber && <p className="text-xs text-muted-foreground font-mono">{acc.accountNumber}</p>}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-blue-700">{formatCurrency(acc.currentBalance)}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Cajas Chicas */}
                    {activePettyCashes.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cajas Chicas</h3>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {activePettyCashes.map(pc => (
                                    <Card key={pc.id} className="border-border">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-foreground">{pc.name}</p>
                                                    <p className="text-xs text-muted-foreground">Ingresos - egresos</p>
                                                </div>
                                                <p className="font-bold text-emerald-700">{formatCurrency(getPettyCashNetBalance(pc.id))}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeBankAccounts.length === 0 && activePettyCashes.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No hay cuentas configuradas.</p>
                            <p className="text-sm">Ve a <strong>Configuración → Banco y Efectivo</strong> para crearlas.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════ CUENTAS BANCARIAS ══════════════════ */}
            {activeTab === "bancos" && (
                <div className="space-y-4">
                    {/* Filtros */}
                    <div className="flex flex-wrap gap-3 items-end bg-card p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filtros:</span>
                        </div>
                        <select
                            value={bkFilterAccount}
                            onChange={e => setBkFilterAccount(e.target.value)}
                            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                        >
                            <option value="">Todas las cuentas</option>
                            {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <select
                            value={bkFilterType}
                            onChange={e => setBkFilterType(e.target.value)}
                            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="Deposito">Depósito</option>
                            <option value="Retiro">Retiro</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Input type="date" value={bkFilterStart} onChange={e => setBkFilterStart(e.target.value)} className="text-sm h-8 w-36" />
                            <span className="text-muted-foreground">–</span>
                            <Input type="date" value={bkFilterEnd} onChange={e => setBkFilterEnd(e.target.value)} className="text-sm h-8 w-36" />
                        </div>
                        {canEdit(currentUser) && (
                            <Button onClick={() => setShowBkModal(true)} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="h-4 w-4 mr-1" /> Nuevo Movimiento
                            </Button>
                        )}
                    </div>

                    {/* Resumen del filtro */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <p className="text-green-700 font-medium">Entradas</p>
                            <p className="text-green-800 font-bold">{formatCurrency(bkEntradas)}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                            <p className="text-red-700 font-medium">Salidas</p>
                            <p className="text-red-800 font-bold">{formatCurrency(bkSalidas)}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                            <p className="text-blue-700 font-medium">Balance Neto</p>
                            <p className={`font-bold ${bkEntradas - bkSalidas >= 0 ? "text-blue-800" : "text-red-800"}`}>
                                {formatCurrency(bkEntradas - bkSalidas)}
                            </p>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="space-y-2">
                        {filteredBkTx.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">No hay movimientos que mostrar.</div>
                        ) : filteredBkTx.map(tx => {
                            const account = bankAccounts.find(a => a.id === tx.bankAccountId);
                            const bank = banks.find(b => b.id === account?.bankId);
                            const isEntrada = tx.type === "Deposito" || (tx.type === "Transferencia" && tx.description.startsWith("Transferencia entrante"));
                            return (
                                <Card key={tx.id} className="border-border">
                                    <CardContent className="p-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isEntrada ? "bg-green-100" : "bg-red-100"}`}>
                                                {isEntrada
                                                    ? <TrendingUp className="h-4 w-4 text-green-600" />
                                                    : <TrendingDown className="h-4 w-4 text-red-600" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground text-sm">{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {account?.name} · {bank?.name} · {new Date(tx.date).toLocaleDateString("es-ES")}
                                                    {tx.reference && ` · Ref: ${tx.reference}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold ${isEntrada ? "text-green-600" : "text-red-600"}`}>
                                                {isEntrada ? "+" : "-"}{formatCurrency(tx.amount)}
                                            </span>
                                            {canDelete(currentUser) && !tx.transferId && !tx.paymentId && !tx.expenseId && (
                                                <button
                                                    onClick={() => setConfirmModal({
                                                        isOpen: true,
                                                        title: "Eliminar Movimiento",
                                                        description: "¿Eliminar este movimiento? El saldo se revertirá automáticamente.",
                                                        variant: "danger",
                                                        onConfirm: async () => {
                                                            try {
                                                                await deleteBankTransaction(tx.id);
                                                                toast.success("Movimiento eliminado");
                                                            } catch { toast.error("Error al eliminar"); }
                                                            setConfirmModal(p => ({ ...p, isOpen: false }));
                                                        }
                                                    })}
                                                    className="text-muted-foreground hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══════════════════ CAJA CHICA ══════════════════ */}
            {activeTab === "caja" && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-end bg-card p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filtros:</span>
                        </div>
                        <select
                            value={cjFilterBox}
                            onChange={e => setCjFilterBox(e.target.value)}
                            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                        >
                            <option value="">Todas las cajas</option>
                            {pettyCashes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select
                            value={cjFilterType}
                            onChange={e => setCjFilterType(e.target.value)}
                            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="Ingreso">Ingreso</option>
                            <option value="Egreso">Egreso</option>
                        </select>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Input type="date" value={cjFilterStart} onChange={e => setCjFilterStart(e.target.value)} className="text-sm h-8 w-36" />
                            <span className="text-muted-foreground">–</span>
                            <Input type="date" value={cjFilterEnd} onChange={e => setCjFilterEnd(e.target.value)} className="text-sm h-8 w-36" />
                        </div>
                        {canEdit(currentUser) && (
                            <Button onClick={() => setShowCjModal(true)} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus className="h-4 w-4 mr-1" /> Nuevo Movimiento
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <p className="text-green-700 font-medium">Ingresos</p>
                            <p className="text-green-800 font-bold">{formatCurrency(cjIngresos)}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                            <p className="text-red-700 font-medium">Egresos</p>
                            <p className="text-red-800 font-bold">{formatCurrency(cjEgresos)}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                            <p className="text-emerald-700 font-medium">Balance Neto</p>
                            <p className={`font-bold ${cjIngresos - cjEgresos >= 0 ? "text-emerald-800" : "text-red-800"}`}>
                                {formatCurrency(cjIngresos - cjEgresos)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Saldo de apertura como primera entrada */}
                        {(cjFilterBox
                            ? pettyCashes.filter(p => p.id === cjFilterBox)
                            : pettyCashes.filter(p => p.active)
                        ).map(pc => (
                            <Card key={`opening-${pc.id}`} className="border-amber-200 bg-amber-50">
                                <CardContent className="p-3 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                                            <Wallet className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-amber-900 text-sm">Saldo de Apertura</p>
                                            <p className="text-xs text-amber-700">{pc.name} · Apertura inicial</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-amber-700">+{formatCurrency(pc.openingBalance)}</span>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredCjTx.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">No hay movimientos que mostrar.</div>
                        )}
                        {filteredCjTx.map(tx => {
                            const box = pettyCashes.find(p => p.id === tx.pettyCashId);
                            const isIngreso = tx.type === "Ingreso";
                            return (
                                <Card key={tx.id} className="border-border">
                                    <CardContent className="p-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isIngreso ? "bg-green-100" : "bg-red-100"}`}>
                                                {isIngreso
                                                    ? <TrendingUp className="h-4 w-4 text-green-600" />
                                                    : <TrendingDown className="h-4 w-4 text-red-600" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground text-sm">{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {box?.name} · {tx.category} · {new Date(tx.date).toLocaleDateString("es-ES")}
                                                    {tx.reference && ` · Ref: ${tx.reference}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold ${isIngreso ? "text-green-600" : "text-red-600"}`}>
                                                {isIngreso ? "+" : "-"}{formatCurrency(tx.amount)}
                                            </span>
                                            {canDelete(currentUser) && !tx.transferId && !tx.paymentId && !tx.expenseId && (
                                                <button
                                                    onClick={() => setConfirmModal({
                                                        isOpen: true,
                                                        title: "Eliminar Movimiento",
                                                        description: "¿Eliminar este movimiento? El saldo se revertirá automáticamente.",
                                                        variant: "danger",
                                                        onConfirm: async () => {
                                                            try {
                                                                await deleteCashTransaction(tx.id);
                                                                toast.success("Movimiento eliminado");
                                                            } catch { toast.error("Error al eliminar"); }
                                                            setConfirmModal(p => ({ ...p, isOpen: false }));
                                                        }
                                                    })}
                                                    className="text-muted-foreground hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══════════════════ TRANSFERENCIAS ══════════════════ */}
            {activeTab === "transferencias" && (
                <div className="space-y-6">
                    {canEdit(currentUser) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ArrowLeftRight className="h-4 w-4" /> Nueva Transferencia
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleTrfSubmit} className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${trfForm.type === "BancoABanco" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border text-muted-foreground"}`}>
                                            <input type="radio" name="trfType" value="BancoABanco" checked={trfForm.type === "BancoABanco"}
                                                onChange={() => setTrfForm(p => ({ ...p, type: "BancoABanco", pettyCashId: "" }))} className="sr-only" />
                                            <Landmark className="h-4 w-4" /> Banco a Banco
                                        </label>
                                        <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${trfForm.type === "CajaABanco" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border text-muted-foreground"}`}>
                                            <input type="radio" name="trfType" value="CajaABanco" checked={trfForm.type === "CajaABanco"}
                                                onChange={() => setTrfForm(p => ({ ...p, type: "CajaABanco", sourceBankAccountId: "", destBankAccountId: "" }))} className="sr-only" />
                                            <Wallet className="h-4 w-4" /> Caja a Banco
                                        </label>
                                        <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors ${trfForm.type === "BancoACaja" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border text-muted-foreground"}`}>
                                            <input type="radio" name="trfType" value="BancoACaja" checked={trfForm.type === "BancoACaja"}
                                                onChange={() => setTrfForm(p => ({ ...p, type: "BancoACaja", destBankAccountId: "" }))} className="sr-only" />
                                            <Landmark className="h-4 w-4" /> Banco a Caja
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {trfForm.type === "BancoABanco" ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Cuenta Origen *</label>
                                                    <select value={trfForm.sourceBankAccountId}
                                                        onChange={e => setTrfForm(p => ({ ...p, sourceBankAccountId: e.target.value }))}
                                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm" required>
                                                        <option value="">Seleccionar cuenta</option>
                                                        {bankAccounts.filter(a => a.active).map(a => (
                                                            <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.currentBalance)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Cuenta Destino *</label>
                                                    <select value={trfForm.destBankAccountId}
                                                        onChange={e => setTrfForm(p => ({ ...p, destBankAccountId: e.target.value }))}
                                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm" required>
                                                        <option value="">Seleccionar cuenta</option>
                                                        {bankAccounts.filter(a => a.active && a.id !== trfForm.sourceBankAccountId).map(a => (
                                                            <option key={a.id} value={a.id}>{a.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        ) : trfForm.type === "CajaABanco" ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Caja Origen *</label>
                                                    <select value={trfForm.pettyCashId}
                                                        onChange={e => setTrfForm(p => ({ ...p, pettyCashId: e.target.value }))}
                                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm" required>
                                                        <option value="">Seleccionar caja</option>
                                                        {pettyCashes.filter(p => p.active).map(p => (
                                                            <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.currentBalance)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Cuenta Bancaria Destino *</label>
                                                    <select value={trfForm.destBankAccountId}
                                                        onChange={e => setTrfForm(p => ({ ...p, destBankAccountId: e.target.value }))}
                                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm" required>
                                                        <option value="">Seleccionar cuenta</option>
                                                        {bankAccounts.filter(a => a.active).map(a => (
                                                            <option key={a.id} value={a.id}>{a.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Cuenta Bancaria Origen *</label>
                                                    <select value={trfForm.sourceBankAccountId}
                                                        onChange={e => setTrfForm(p => ({ ...p, sourceBankAccountId: e.target.value }))}
                                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm" required>
                                                        <option value="">Seleccionar cuenta</option>
                                                        {bankAccounts.filter(a => a.active).map(a => (
                                                            <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.currentBalance)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Caja Destino *</label>
                                                    <select value={trfForm.pettyCashId}
                                                        onChange={e => setTrfForm(p => ({ ...p, pettyCashId: e.target.value }))}
                                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm" required>
                                                        <option value="">Seleccionar caja</option>
                                                        {pettyCashes.filter(p => p.active).map(p => (
                                                            <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.currentBalance)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Monto *</label>
                                            <Input
                                                value={trfForm.amount}
                                                onChange={e => setTrfForm(p => ({ ...p, amount: e.target.value }))}
                                                placeholder="0" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Fecha *</label>
                                            <Input type="date" value={trfForm.date}
                                                onChange={e => setTrfForm(p => ({ ...p, date: e.target.value }))} required />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Descripción *</label>
                                            <Input value={trfForm.description}
                                                onChange={e => setTrfForm(p => ({ ...p, description: e.target.value }))}
                                                placeholder="Motivo de la transferencia" required />
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={trfSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {trfSubmitting ? "Registrando…" : "Registrar Transferencia"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Historial */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Historial Reciente</h3>
                        <div className="space-y-2">
                            {transfers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No hay transferencias registradas.</div>
                            ) : transfers.slice(0, 20).map(trf => {
                                const srcAcc = bankAccounts.find(a => a.id === trf.sourceBankAccountId);
                                const dstAcc = bankAccounts.find(a => a.id === trf.destBankAccountId);
                                const srcBox = pettyCashes.find(p => p.id === trf.pettyCashId);
                                return (
                                    <Card key={trf.id} className="border-border">
                                        <CardContent className="p-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <ArrowLeftRight className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{trf.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {trf.type === "BancoABanco"
                                                            ? `${srcAcc?.name || "?"} → ${dstAcc?.name || "?"}`
                                                            : trf.type === "CajaABanco"
                                                            ? `${srcBox?.name || "?"} → ${dstAcc?.name || "?"}`
                                                            : `${srcAcc?.name || "?"} → ${srcBox?.name || "?"}`
                                                        } · {new Date(trf.date).toLocaleDateString("es-ES")}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-indigo-700">{formatCurrency(trf.amount)}</span>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════ MODAL: Nuevo Movimiento Bancario ══════ */}
            {showBkModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Nuevo Movimiento Bancario</CardTitle>
                                <button onClick={() => setShowBkModal(false)}><X className="h-4 w-4" /></button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleBkSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cuenta *</label>
                                    <select value={bkForm.bankAccountId} onChange={e => setBkForm(p => ({ ...p, bankAccountId: e.target.value }))}
                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm" required>
                                        <option value="">Seleccionar cuenta</option>
                                        {bankAccounts.filter(a => a.active).map(a => (
                                            <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.currentBalance)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                                    <select value={bkForm.type} onChange={e => setBkForm(p => ({ ...p, type: e.target.value as "Deposito" | "Retiro" }))}
                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm">
                                        <option value="Deposito">Depósito</option>
                                        <option value="Retiro">Retiro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Monto *</label>
                                    <Input value={bkForm.amount} onChange={e => setBkForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha *</label>
                                    <Input type="date" value={bkForm.date} onChange={e => setBkForm(p => ({ ...p, date: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Descripción *</label>
                                    <Input value={bkForm.description} onChange={e => setBkForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del movimiento" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Referencia</label>
                                    <Input value={bkForm.reference} onChange={e => setBkForm(p => ({ ...p, reference: e.target.value }))} placeholder="Número de referencia (opcional)" />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setShowBkModal(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={bkSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {bkSubmitting ? "Guardando…" : "Guardar"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ══════ MODAL: Nuevo Movimiento Caja ══════ */}
            {showCjModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Nuevo Movimiento de Caja</CardTitle>
                                <button onClick={() => setShowCjModal(false)}><X className="h-4 w-4" /></button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCjSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Caja *</label>
                                    <select value={cjForm.pettyCashId} onChange={e => setCjForm(p => ({ ...p, pettyCashId: e.target.value }))}
                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm" required>
                                        <option value="">Seleccionar caja</option>
                                        {pettyCashes.filter(p => p.active).map(p => (
                                            <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.currentBalance)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                                    <select value={cjForm.type} onChange={e => setCjForm(p => ({ ...p, type: e.target.value as "Ingreso" | "Egreso" }))}
                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm">
                                        <option value="Ingreso">Ingreso</option>
                                        <option value="Egreso">Egreso</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoría *</label>
                                    <select value={cjForm.category} onChange={e => setCjForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm">
                                        <option value="Pago de Renta">Pago de Renta</option>
                                        <option value="Gasto Operativo">Gasto Operativo</option>
                                        <option value="Depósito a Banco">Depósito a Banco</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Monto *</label>
                                    <Input value={cjForm.amount} onChange={e => setCjForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha *</label>
                                    <Input type="date" value={cjForm.date} onChange={e => setCjForm(p => ({ ...p, date: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Descripción *</label>
                                    <Input value={cjForm.description} onChange={e => setCjForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del movimiento" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Referencia</label>
                                    <Input value={cjForm.reference} onChange={e => setCjForm(p => ({ ...p, reference: e.target.value }))} placeholder="Referencia (opcional)" />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setShowCjModal(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={cjSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        {cjSubmitting ? "Guardando…" : "Guardar"}
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
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
            />
        </div>
    );
}
