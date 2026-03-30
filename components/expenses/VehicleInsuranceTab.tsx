"use client";

import { useState } from "react";
import { useData, VehicleInsurance } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, X, Search, Calendar, Trash2, Edit, AlertTriangle, Clock, CheckCircle, Car, ShieldCheck } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

function getAlertStatus(expiryDate: string): "Vencido" | "Próximo a Vencer" | "Vigente" {
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
    if (diffDays < 0) return "Vencido";
    if (diffDays <= 30) return "Próximo a Vencer";
    return "Vigente";
}

function getDaysRemaining(expiryDate: string): number {
    return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
}

function AlertBadge({ expiryDate }: { expiryDate: string }) {
    const status = getAlertStatus(expiryDate);
    const days = getDaysRemaining(expiryDate);

    if (status === "Vencido") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle className="h-3 w-3" />
                Vencido ({Math.abs(days)}d)
            </span>
        );
    }
    if (status === "Próximo a Vencer") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                <Clock className="h-3 w-3" />
                Vence en {days}d
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="h-3 w-3" />
            Vigente
        </span>
    );
}

export default function VehicleInsuranceTab() {
    const {
        vehicleInsurances,
        addVehicleInsurance,
        updateVehicleInsurance,
        deleteVehicleInsurance,
        vehicles,
        expenseCategories,
        currentUser,
        canEdit,
        canDelete,
    } = useData();

    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        description: "",
        confirmText: "",
        variant: "danger" as "danger" | "success" | "info" | undefined,
        onConfirm: () => { },
    });

    const [formData, setFormData] = useState({
        vehicleId: "",
        categoryId: "",
        insurer: "",
        policyNumber: "",
        coverageType: "",
        amount: "",
        startDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        paymentStatus: "Pagado" as "Pagado" | "Pendiente",
        notes: "",
    });

    const expiredCount = vehicleInsurances.filter(i => getAlertStatus(i.expiryDate) === "Vencido").length;
    const soonCount = vehicleInsurances.filter(i => getAlertStatus(i.expiryDate) === "Próximo a Vencer").length;

    const filtered = vehicleInsurances.filter(ins => {
        const vehicle = vehicles.find(v => v.id === ins.vehicleId);
        const term = searchTerm.toLowerCase();
        return (
            ins.insurer.toLowerCase().includes(term) ||
            ins.policyNumber.toLowerCase().includes(term) ||
            ins.coverageType.toLowerCase().includes(term) ||
            vehicle?.name.toLowerCase().includes(term) ||
            vehicle?.plate.toLowerCase().includes(term)
        );
    });

    const resetForm = () => {
        setFormData({
            vehicleId: "",
            categoryId: "",
            insurer: "",
            policyNumber: "",
            coverageType: "",
            amount: "",
            startDate: new Date().toISOString().split("T")[0],
            expiryDate: "",
            paymentStatus: "Pagado",
            notes: "",
        });
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                vehicleId: formData.vehicleId,
                categoryId: formData.categoryId || undefined,
                insurer: formData.insurer,
                policyNumber: formData.policyNumber,
                coverageType: formData.coverageType,
                amount: parseFloat(formData.amount.replace(/\s/g, '')),
                startDate: formData.startDate,
                expiryDate: formData.expiryDate,
                paymentStatus: formData.paymentStatus,
                notes: formData.notes || undefined,
            };

            if (editingId) {
                await updateVehicleInsurance(editingId, payload);
                toast.success("Seguro actualizado correctamente.");
            } else {
                await addVehicleInsurance(payload);
                toast.success("Seguro registrado correctamente.");
            }
            setShowModal(false);
            resetForm();
        } catch (err) {
            toast.error("Error al guardar el seguro.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (ins: VehicleInsurance) => {
        setFormData({
            vehicleId: ins.vehicleId,
            categoryId: ins.categoryId || "",
            insurer: ins.insurer,
            policyNumber: ins.policyNumber,
            coverageType: ins.coverageType,
            amount: Math.round(ins.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
            startDate: ins.startDate.split("T")[0],
            expiryDate: ins.expiryDate.split("T")[0],
            paymentStatus: ins.paymentStatus,
            notes: ins.notes || "",
        });
        setEditingId(ins.id);
        setShowModal(true);
    };

    const handleDeleteClick = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Eliminar Seguro",
            description: "¿Estás seguro de eliminar este registro de seguro?",
            confirmText: "Eliminar",
            variant: "danger",
            onConfirm: async () => {
                try {
                    await deleteVehicleInsurance(id);
                    toast.success("Seguro eliminado.");
                } catch {
                    toast.error("Error al eliminar el seguro.");
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Seguros Vehiculares</h3>
                    <p className="text-sm text-muted-foreground">Gestiona las pólizas de seguro de cada vehículo y sus fechas de vencimiento.</p>
                </div>
                {canEdit(currentUser) && (
                    <Button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Registrar Seguro
                    </Button>
                )}
            </div>

            {/* Alert Summary */}
            {(expiredCount > 0 || soonCount > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                    {expiredCount > 0 && (
                        <Card className="border-red-200 bg-red-50 shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-red-700 text-lg">{expiredCount}</p>
                                    <p className="text-xs text-red-600">Seguro{expiredCount !== 1 ? "s" : ""} vencido{expiredCount !== 1 ? "s" : ""}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {soonCount > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50 shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-200">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-yellow-700 text-lg">{soonCount}</p>
                                    <p className="text-xs text-yellow-600">Próximo{soonCount !== 1 ? "s" : ""} a vencer (≤30 días)</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por aseguradora, póliza, vehículo o tipo de cobertura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>

            {/* List */}
            <div className="space-y-3">
                {filtered.map((ins) => {
                    const vehicle = vehicles.find(v => v.id === ins.vehicleId);
                    const alertStatus = getAlertStatus(ins.expiryDate);
                    return (
                        <Card
                            key={ins.id}
                            className={`border-border bg-card hover:bg-accent/50 transition-colors shadow-sm ${alertStatus === "Vencido" ? "border-l-4 border-l-red-500" : alertStatus === "Próximo a Vencer" ? "border-l-4 border-l-yellow-500" : ""}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200 shrink-0">
                                            <ShieldCheck className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
                                            <div className="md:col-span-1">
                                                <p className="font-bold text-foreground text-sm">{ins.insurer}</p>
                                                <p className="text-xs text-muted-foreground font-mono">Póliza: {ins.policyNumber}</p>
                                                <p className="text-xs text-muted-foreground">{ins.coverageType}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Car className="h-3 w-3 text-teal-500" />
                                                <span>{vehicle ? `${vehicle.name} (${vehicle.plate})` : "Vehículo no encontrado"}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-blue-400" />
                                                    <span>Inicio: {new Date(ins.startDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-red-400" />
                                                    <span>Vence: {new Date(ins.expiryDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 justify-end">
                                                <span className="font-bold text-foreground">{formatCurrency(ins.amount)}</span>
                                                <AlertBadge expiryDate={ins.expiryDate} />
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ins.paymentStatus === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {ins.paymentStatus}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {canEdit(currentUser) && (
                                                        <button onClick={() => handleEdit(ins)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {canDelete(currentUser) && (
                                                        <button onClick={() => handleDeleteClick(ins.id)} className="p-1 hover:bg-muted rounded text-red-500 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
                        <p className="text-muted-foreground">No se encontraron seguros registrados.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg border-border bg-card shadow-xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                            <CardTitle className="text-foreground">{editingId ? "Editar Seguro" : "Registrar Seguro"}</CardTitle>
                            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground font-medium">Aseguradora *</label>
                                        <Input
                                            value={formData.insurer}
                                            onChange={(e) => setFormData({ ...formData, insurer: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            placeholder="Ej. AXA Seguros"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground font-medium">Número de Póliza *</label>
                                        <Input
                                            value={formData.policyNumber}
                                            onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            placeholder="Ej. POL-2026-001"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Vehículo *</label>
                                    <select
                                        value={formData.vehicleId}
                                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                        required
                                    >
                                        <option value="">Seleccionar vehículo</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Tipo de Cobertura *</label>
                                    <Input
                                        value={formData.coverageType}
                                        onChange={(e) => setFormData({ ...formData, coverageType: e.target.value })}
                                        className="bg-background border-input text-foreground mt-1"
                                        placeholder="Ej. Todo Riesgo, Responsabilidad Civil..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Categoría de Gasto</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                    >
                                        <option value="">Sin categoría</option>
                                        {expenseCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground font-medium">Prima (FCFA) *</label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={formData.amount}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/[^0-9]/g, '');
                                                    setFormData({ ...formData, amount: raw.replace(/\B(?=(\d{3})+(?!\d))/g, " ") });
                                                }}
                                                className="bg-background border-input text-foreground mt-1 pr-12"
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-[calc(50%-2px)] text-muted-foreground text-xs font-medium">FCFA</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground font-medium">Estado de Pago</label>
                                        <select
                                            value={formData.paymentStatus}
                                            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as "Pagado" | "Pendiente" })}
                                            className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground mt-1"
                                        >
                                            <option value="Pagado">Pagado</option>
                                            <option value="Pendiente">Pendiente</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground font-medium">Fecha de Inicio *</label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground font-medium">Fecha de Vencimiento *</label>
                                        <Input
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            className="bg-background border-input text-foreground mt-1"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground font-medium">Notas</label>
                                    <Input
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="bg-background border-input text-foreground mt-1"
                                        placeholder="Observaciones opcionales..."
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border pt-6">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {isSubmitting ? "Guardando..." : editingId ? "Guardar Cambios" : "Registrar Seguro"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
            />
        </div>
    );
}
