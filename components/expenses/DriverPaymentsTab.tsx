"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Calendar, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function DriverPaymentsTab() {
    const { driverPayments, personnel, addDriverPayment } = useData();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Only show personnel with role "Conductor"
    const drivers = useMemo(() => personnel.filter(p => p.role === 'Conductor' && p.status === 'Activo'), [personnel]);

    const [formData, setFormData] = useState({
        personnelId: "",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        concept: "",
        notes: ""
    });

    const filteredPayments = driverPayments.filter(payment => {
        const driverName = personnel.find(p => p.id === payment.personnelId)?.name || "";
        return driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.concept.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addDriverPayment(formData);
            toast.success("Pago registrado correctamente");
            setShowModal(false);
            setFormData({
                personnelId: "",
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                concept: "",
                notes: ""
            });
        } catch (error) {
            console.error("Error adding driver payment:", error);
            toast.error("Error al registrar el pago");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Pagos a Conductores</h3>
                    <p className="text-sm text-muted-foreground">Registra y controla los pagos realizados a conductores.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Registrar Pago
                </Button>
            </div>

            {/* Stats/Summary could go here */}

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por conductor o concepto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus-visible:ring-0"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPayments.map((payment) => {
                    const driver = personnel.find(p => p.id === payment.personnelId);
                    return (
                        <Card key={payment.id} className="border-border bg-card hover:shadow-md transition-all">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-foreground">{driver?.name || "Desconocido"}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(payment.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-orange-600">-{formatCurrency(payment.amount)}</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border">
                                    <div className="text-sm font-medium text-foreground">{payment.concept}</div>
                                    {payment.notes && <div className="text-xs text-muted-foreground mt-1">{payment.notes}</div>}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border bg-card shadow-lg">
                        <CardHeader className="border-b border-border">
                            <CardTitle>Registrar Pago a Conductor</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground">Conductor</label>
                                    <select
                                        value={formData.personnelId}
                                        onChange={(e) => setFormData({ ...formData, personnelId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground focus:ring-2 focus:ring-orange-600"
                                        required
                                    >
                                        <option value="">Seleccionar Conductor</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.licenseNumber})</option>
                                        ))}
                                    </select>
                                    {drivers.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">No hay conductores activos registrados. Ve a la sección de Personal para agregar uno.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">Concepto</label>
                                    <Input
                                        value={formData.concept}
                                        onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                                        placeholder="Ej: Comisión viaje a..."
                                        className="bg-background border-input"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Monto (FCFA)</label>
                                        <Input
                                            type="number"
                                            value={formData.amount === 0 ? "" : formData.amount}
                                            onChange={(e) => {
                                                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                                            }}
                                            placeholder="0"
                                            className="bg-background border-input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Fecha</label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-background border-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">Notas Adicionales</label>
                                    <Input
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="bg-background border-input"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancelar</Button>
                                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmitting}>
                                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</> : "Registrar Pago"}
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
