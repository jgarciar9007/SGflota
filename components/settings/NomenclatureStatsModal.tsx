
"use client";


import { Card, CardContent } from "@/components/ui/Card";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/utils";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NomenclatureStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "Client" | "Agent" | "Owner" | "Personnel";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entity: any; // The actual object (Client, CommercialAgent, Owner, Personnel)
}

export default function NomenclatureStatsModal({ isOpen, onClose, type, entity }: NomenclatureStatsModalProps) {
    const { invoices, payments, rentals, vehicles, accountsPayable, driverPayments, payrolls } = useData();

    if (!isOpen || !entity) return null;

    // --- Statistics Calculation Logic ---
    const stats = {
        totalMovements: 0,
        totalIncome: 0, // Money coming IN to the company (from Client)
        totalExpense: 0, // Money going OUT from company (to Owner/Agent/Personnel)
        pending: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: [] as any[] // List of transactions/movements
    };

    if (type === "Client") {
        // Invoices and Payments
        const clientInvoices = invoices.filter(i => i.clientId === entity.id);
        const clientPayments = payments.filter(p => p.clientId === entity.id);

        const totalInvoiced = clientInvoices.reduce((sum, i) => sum + i.amount, 0);
        const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);

        stats.totalMovements = clientInvoices.length + clientPayments.length;
        stats.totalIncome = totalPaid;
        stats.pending = totalInvoiced - totalPaid;

        // Items list
        stats.items = [
            ...clientInvoices.map(i => ({ date: i.date, type: "Factura", desc: `#${i.invoiceNumber}`, amount: i.amount, isPositive: true })),
            ...clientPayments.map(p => ({ date: p.date, type: "Pago", desc: `Recibo #${p.receiptId}`, amount: p.amount, isPositive: true }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } else if (type === "Agent") {
        // Rentals linked (by Agent Name match in Rental, typically) and Commissions (APs)
        // Assumption: Rental has 'commercialAgent' string which stores the name.
        const agentRentals = rentals.filter(r => r.commercialAgent === entity.name);
        const agentAPs = accountsPayable.filter(ap => ap.type === "Comercial" && ap.beneficiaryDni === entity.dni);

        const totalCommissions = agentAPs.reduce((sum, ap) => sum + ap.amount, 0);
        // Pending commissions?
        const pendingCommissions = agentAPs.filter(ap => ap.status === 'Pendiente').reduce((sum, ap) => sum + ap.amount, 0);

        stats.totalMovements = agentRentals.length + agentAPs.length;
        stats.totalExpense = totalCommissions;
        stats.pending = pendingCommissions;

        stats.items = [
            ...agentRentals.map(r => ({ date: r.startDate, type: "Renta", desc: `Vehículo por ${r.totalAmount || 0}`, amount: r.totalAmount || 0, isPositive: null })),
            ...agentAPs.map(ap => ({ date: ap.date, type: "Comisión", desc: `Pago Comisión`, amount: ap.amount, isPositive: false }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } else if (type === "Owner") {
        // Vehicles, APs
        const ownerVehicles = vehicles.filter(v => v.ownerDni === entity.dni);
        const ownerAPs = accountsPayable.filter(ap => ap.type === "Propietario" && ap.beneficiaryDni === entity.dni);

        const totalPaidToOwner = ownerAPs.filter(ap => ap.status === 'Pagado').reduce((sum, ap) => sum + ap.amount, 0);
        const pendingToOwner = ownerAPs.filter(ap => ap.status === 'Pendiente').reduce((sum, ap) => sum + ap.amount, 0);

        stats.totalMovements = ownerVehicles.length + ownerAPs.length;
        stats.totalExpense = totalPaidToOwner;
        stats.pending = pendingToOwner;

        stats.items = [
            ...ownerAPs.map(ap => ({ date: ap.date, type: "Pago Propietario", desc: ap.status, amount: ap.amount, isPositive: false }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } else if (type === "Personnel") {
        if (entity.role === "Conductor") {
            const payments = driverPayments.filter(dp => dp.personnelId === entity.id);
            const total = payments.reduce((sum, p) => sum + p.amount, 0);

            stats.totalExpense = total;
            stats.totalMovements = payments.length;

            stats.items = payments.map(p => ({
                date: p.date, type: "Pago Conductor", desc: p.concept, amount: p.amount, isPositive: false
            })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        } else {
            // Staff - Payrolls via JSON parsing
            // This is heavy but necessary.
            const myPayrolls = payrolls.map(p => {
                try {
                    const details = JSON.parse(p.details);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const myDetail = details.find((d: any) => d.personnelId === entity.id);
                    return myDetail ? { ...myDetail, date: new Date(p.year, p.month - 1, 1).toISOString(), month: p.month, year: p.year } : null;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (e) { return null; }
            }).filter(Boolean);

            const totalSalary = myPayrolls.reduce((sum, mp) => sum + (mp.total || 0), 0);

            stats.totalExpense = totalSalary;
            stats.totalMovements = myPayrolls.length;

            stats.items = myPayrolls.map(mp => ({
                date: mp.date, type: "Nómina", desc: `${mp.month}/${mp.year}`, amount: mp.total, isPositive: false
            })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl border border-border flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{entity.name}</h2>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Estadísticas de {type === "Personnel" ? "Personal" : type === "Owner" ? "Propietario" : type === "Agent" ? "Agente" : "Cliente"}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 border-blue-100">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-blue-600">Movimientos Totales</p>
                                <h3 className="text-3xl font-bold text-blue-900 mt-2">{stats.totalMovements}</h3>
                            </CardContent>
                        </Card>

                        {(type === "Client") ? (
                            <>
                                <Card className="bg-green-50 border-green-100">
                                    <CardContent className="p-6">
                                        <p className="text-sm font-medium text-green-600">Total Ingresado</p>
                                        <h3 className="text-3xl font-bold text-green-900 mt-2">{formatCurrency(stats.totalIncome)}</h3>
                                    </CardContent>
                                </Card>
                                <Card className={`border-100 ${stats.pending > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <CardContent className="p-6">
                                        <p className={`text-sm font-medium ${stats.pending > 0 ? 'text-red-600' : 'text-gray-600'}`}>Pendiente de Cobro</p>
                                        <h3 className={`text-3xl font-bold mt-2 ${stats.pending > 0 ? 'text-red-900' : 'text-gray-900'}`}>{formatCurrency(stats.pending)}</h3>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <>
                                <Card className="bg-orange-50 border-orange-100">
                                    <CardContent className="p-6">
                                        <p className="text-sm font-medium text-orange-600">Total Pagado (Gastos)</p>
                                        <h3 className="text-3xl font-bold text-orange-900 mt-2">{formatCurrency(stats.totalExpense)}</h3>
                                    </CardContent>
                                </Card>
                                {(type === "Agent" || type === "Owner") && (
                                    <Card className="bg-purple-50 border-purple-100">
                                        <CardContent className="p-6">
                                            <p className="text-sm font-medium text-purple-600">Pendiente de Pago</p>
                                            <h3 className="text-3xl font-bold text-purple-900 mt-2">{formatCurrency(stats.pending)}</h3>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>

                    {/* Transaction List */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-foreground">Historial de Movimientos</h3>
                        <div className="border border-border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Fecha</th>
                                        <th className="px-4 py-3 text-left">Tipo</th>
                                        <th className="px-4 py-3 text-left">Descripción</th>
                                        <th className="px-4 py-3 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {stats.items.length > 0 ? (
                                        stats.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 text-foreground">{new Date(item.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 rounded-full bg-muted text-xs font-medium">{item.type}</span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.desc}</td>
                                                <td className={`px-4 py-3 text-right font-medium ${item.isPositive === true ? 'text-green-600' : item.isPositive === false ? 'text-red-600' : 'text-foreground'}`}>
                                                    {item.isPositive === false && "- "}
                                                    {formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground">No hay movimientos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
