"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Calendar, DollarSign, Eye, CheckCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface PayrollItem {
    personnelId: string;
    name: string;
    role: string;
    baseSalary: number;
    bonus: number;
    deductions: number;
    total: number;
}

export default function PayrollTab() {
    const { payrolls, personnel, addPayroll } = useData();
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Payroll form state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [previewPayroll, setPreviewPayroll] = useState<PayrollItem[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [viewPayroll, setViewPayroll] = useState<any | null>(null);

    // Filter staff (non-drivers)
    const staff = useMemo(() => personnel.filter(p => p.role !== 'Conductor' && p.status === 'Activo'), [personnel]);

    const handlePreparePayroll = () => {
        // Generate preview based on salaries
        const preview = staff.map(p => ({
            personnelId: p.id,
            name: p.name,
            role: p.role,
            baseSalary: p.salary || 0,
            bonus: 0,
            deductions: 0,
            total: p.salary || 0
        }));
        setPreviewPayroll(preview);
        setShowGenerateModal(true);
    };

    const handleUpdatePreview = (index: number, field: 'bonus' | 'deductions', value: number) => {
        const updated = [...previewPayroll];
        updated[index][field] = value;
        updated[index].total = updated[index].baseSalary + updated[index].bonus - updated[index].deductions;
        setPreviewPayroll(updated);
    };

    const handleConfirmPayroll = async () => {
        setIsSubmitting(true);
        try {
            const totalAmount = previewPayroll.reduce((sum, item) => sum + item.total, 0);
            await addPayroll({
                month: selectedMonth,
                year: selectedYear,
                totalAmount,
                status: "Pagado",
                details: JSON.stringify(previewPayroll)
            });
            toast.success("Nómina generada correctamente");
            setShowGenerateModal(false);
        } catch (error) {
            console.error("Error generating payroll:", error);
            toast.error("Error al generar la nómina");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to get month name
    const getMonthName = (m: number) => {
        return new Date(2000, m - 1, 1).toLocaleString('es-ES', { month: 'long' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Nómina del Personal</h3>
                    <p className="text-sm text-muted-foreground">Genera y consulta el histórico de nóminas (Personal Administrativo/Mecánicos).</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="h-10 rounded-md border border-input bg-background px-3"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{getMonthName(m)}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="h-10 rounded-md border border-input bg-background px-3"
                    >
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                    <Button onClick={handlePreparePayroll} className="bg-green-600 hover:bg-green-700 text-white">
                        <DollarSign className="mr-2 h-4 w-4" /> Generar Nómina
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {payrolls.map((payroll) => (
                    <Card key={payroll.id} className="border-border bg-card">
                        <CardHeader className="bg-muted/30 pb-3">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    Nómina: {getMonthName(payroll.month)} {payroll.year}
                                </CardTitle>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200 uppercase font-bold">
                                    {payroll.status}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-end mb-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Total Pagado</p>
                                    <p className="text-3xl font-bold text-green-600">{formatCurrency(payroll.totalAmount)}</p>
                                </div>
                                <Button variant="outline" size="sm" className="text-muted-foreground" onClick={() => setViewPayroll(payroll)}>
                                    <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                </Button>
                            </div>
                            {/* Mini preview of staff paid */}
                            <div className="flex gap-2 flex-wrap">
                                {JSON.parse(payroll.details).map((d: PayrollItem, i: number) => (
                                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {d.name}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {payrolls.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                        No hay nóminas registradas. Selecciona un mes y año para generar una nueva.
                    </div>
                )}
            </div>

            {/* Modal Generation */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-4xl border-border bg-card shadow-lg max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b border-border sticky top-0 bg-card z-10">
                            <CardTitle>Generar Nómina: {getMonthName(selectedMonth)} {selectedYear}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted">
                                    <tr>
                                        <th className="px-4 py-3">Empleado</th>
                                        <th className="px-4 py-3">Salario Base</th>
                                        <th className="px-4 py-3">Bonificaciones</th>
                                        <th className="px-4 py-3">Deducciones</th>
                                        <th className="px-4 py-3 text-right">Total a Pagar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {previewPayroll.map((item, idx) => (
                                        <tr key={item.personnelId}>
                                            <td className="px-4 py-3 font-medium">
                                                {item.name}
                                                <div className="text-xs text-muted-foreground font-normal">{item.role}</div>
                                            </td>
                                            <td className="px-4 py-3 font-mono">{formatCurrency(item.baseSalary)}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    className="w-24 bg-muted/50 border border-border rounded px-2 py-1 text-right"
                                                    value={item.bonus === 0 ? '' : item.bonus}
                                                    onChange={(e) => handleUpdatePreview(idx, 'bonus', parseFloat(e.target.value) || 0)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    className="w-24 bg-muted/50 border border-border rounded px-2 py-1 text-right text-red-600"
                                                    value={item.deductions === 0 ? '' : item.deductions}
                                                    onChange={(e) => handleUpdatePreview(idx, 'deductions', parseFloat(e.target.value) || 0)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-green-600 font-mono">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-muted font-bold">
                                    <tr>
                                        <td colSpan={4} className="px-4 py-3 text-right">TOTAL NÓMINA:</td>
                                        <td className="px-4 py-3 text-right text-lg">
                                            {formatCurrency(previewPayroll.reduce((sum, i) => sum + i.total, 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                                <Button variant="ghost" onClick={() => setShowGenerateModal(false)}>Cancelar</Button>
                                <Button onClick={handleConfirmPayroll} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Confirmar y Guardar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* View Details Modal */}
            {viewPayroll && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-4xl border-border bg-card shadow-lg max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b border-border sticky top-0 bg-card z-10 flex flex-row items-center justify-between">
                            <CardTitle>Detalle de Nómina: {getMonthName(viewPayroll.month)} {viewPayroll.year}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setViewPayroll(null)}><span className="sr-only">Cerrar</span>✕</Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between bg-muted/20 p-4 rounded-lg border border-border">
                                <div>
                                    <p className="text-sm text-muted-foreground">Estado</p>
                                    <p className="font-bold text-green-600">{viewPayroll.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground text-right sm:text-left">Monto Total</p>
                                    <p className="text-2xl font-bold font-mono">{formatCurrency(viewPayroll.totalAmount)}</p>
                                </div>
                            </div>

                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted">
                                    <tr>
                                        <th className="px-4 py-3">Empleado</th>
                                        <th className="px-4 py-3 text-right">Salario Base</th>
                                        <th className="px-4 py-3 text-right">Bonificaciones</th>
                                        <th className="px-4 py-3 text-right">Deducciones</th>
                                        <th className="px-4 py-3 text-right">Total Pagado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {JSON.parse(viewPayroll.details).map((item: PayrollItem) => (
                                        <tr key={item.personnelId}>
                                            <td className="px-4 py-3 font-medium">
                                                {item.name}
                                                <div className="text-xs text-muted-foreground font-normal">{item.role}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatCurrency(item.baseSalary)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-blue-600">{item.bonus > 0 ? `+${formatCurrency(item.bonus)}` : '-'}</td>
                                            <td className="px-4 py-3 text-right font-mono text-red-600">{item.deductions > 0 ? `-${formatCurrency(item.deductions)}` : '-'}</td>
                                            <td className="px-4 py-3 text-right font-bold text-foreground font-mono">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mt-6">
                                <Button variant="outline" onClick={() => setViewPayroll(null)}>Cerrar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
