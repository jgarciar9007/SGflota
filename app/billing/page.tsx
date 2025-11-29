"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DollarSign, Calendar, User, CheckCircle, Clock, Plus, X, Printer, CreditCard, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { generateDocumentHtml } from "@/lib/reportUtils";

export default function BillingPage() {
    const { invoices, clients, rentals, vehicles, companySettings, addInvoice, addPayment, payments } = useData();
    const [activeTab, setActiveTab] = useState<"invoices" | "history">("invoices");
    const [showAddModal, setShowAddModal] = useState(false);

    // Multi-invoice payment state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState<1 | 2 | 3>(1);
    const [selectedClientId, setSelectedClientId] = useState("");
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [totalPaymentAmount, setTotalPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Transferencia");
    const [allocations, setAllocations] = useState<{ invoiceId: string; amount: number }[]>([]);

    const [formData, setFormData] = useState({
        clientId: "",
        amount: "",
        description: "",
    });

    // --- Payment Modal Logic ---

    const handleOpenPaymentModal = (preselectedClientId?: string, preselectedInvoiceId?: string) => {
        setPaymentStep(1);
        setSelectedClientId(preselectedClientId || "");
        setSelectedInvoiceIds(preselectedInvoiceId ? [preselectedInvoiceId] : []);
        setTotalPaymentAmount("");
        setAllocations([]);
        setShowPaymentModal(true);

        // If client is preselected, move to step 2 immediately
        if (preselectedClientId) {
            setPaymentStep(2);
        }
    };

    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId);
        setSelectedInvoiceIds([]);
        setPaymentStep(2);
    };

    const toggleInvoiceSelection = (invoiceId: string) => {
        setSelectedInvoiceIds(prev =>
            prev.includes(invoiceId)
                ? prev.filter(id => id !== invoiceId)
                : [...prev, invoiceId]
        );
    };

    const calculateAllocations = () => {
        const amount = parseFloat(totalPaymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        const selectedInvoices = invoices
            .filter(inv => selectedInvoiceIds.includes(inv.id))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Oldest first

        let remaining = amount;
        const newAllocations: { invoiceId: string; amount: number }[] = [];

        for (const invoice of selectedInvoices) {
            if (remaining <= 0) break;

            const pending = invoice.amount - invoice.paidAmount;
            const allocate = Math.min(pending, remaining);

            newAllocations.push({ invoiceId: invoice.id, amount: allocate });
            remaining -= allocate;
        }

        setAllocations(newAllocations);
        setPaymentStep(3);
    };

    const handleConfirmPayment = () => {
        if (allocations.length === 0) return;

        const receiptId = addPayment(selectedClientId, allocations, paymentMethod);

        // Generate receipt
        setTimeout(() => {
            handlePrintReceipt(receiptId);
        }, 100);

        setShowPaymentModal(false);
    };

    // --- Invoice Creation Logic ---

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addInvoice({
            clientId: formData.clientId,
            rentalId: "",
            amount: parseFloat(formData.amount),
            date: new Date().toISOString().split("T")[0],
            status: "Pendiente",
        });
        setShowAddModal(false);
        setFormData({
            clientId: "",
            amount: "",
            description: "",
        });
    };

    // --- Printing Logic ---

    const handlePrintReceipt = (receiptId: string) => {
        const receiptPayments = payments.filter(p => p.receiptId === receiptId);
        if (receiptPayments.length === 0) return;

        const firstPayment = receiptPayments[0];
        const client = clients.find(c => c.id === firstPayment.clientId);
        const totalAmount = receiptPayments.reduce((sum, p) => sum + p.amount, 0);
        const paymentDate = firstPayment.date;
        const method = firstPayment.method;

        const content = `
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 40px;">
                <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; margin-bottom: 5px;">Monto Recibido</div>
                <div style="font-size: 42px; font-weight: 800;">${formatCurrency(totalAmount)}</div>
                <div style="font-size: 14px; margin-top: 5px; opacity: 0.9;">Método: ${method}</div>
                <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">N° ${receiptId.slice(-8)} • ${new Date(paymentDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Información del Cliente</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">Nombre:</span><span style="font-weight: 600; color: #1f2937;">${client?.name || 'N/A'}</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">DNI/NIF:</span><span style="font-weight: 600; color: #1f2937;">${client?.dni || 'N/A'}</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">Email:</span><span style="font-weight: 600; color: #1f2937;">${client?.email || 'N/A'}</span></div>
            </div>

            <div class="section-title">Detalle de Aplicación de Pago</div>
            <table>
                <thead>
                    <tr>
                        <th>Factura</th>
                        <th>Fecha</th>
                        <th style="text-align: right;">Monto Aplicado</th>
                    </tr>
                </thead>
                <tbody>
                    ${receiptPayments.map(p => {
            const inv = invoices.find(i => i.id === p.invoiceId);
            return `
                        <tr>
                            <td>#${p.invoiceId.slice(0, 8)}</td>
                            <td>${inv ? new Date(inv.date).toLocaleDateString() : '-'}</td>
                            <td style="text-align: right; font-weight: bold;">${formatCurrency(p.amount)}</td>
                        </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;

        const html = generateDocumentHtml("Comprobante de Pago", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const handlePrintInvoice = (invoiceId: string) => {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (!invoice) return;

        const client = clients.find(c => c.id === invoice.clientId);
        const rental = rentals.find(r => r.id === invoice.rentalId);
        const vehicle = rental ? vehicles.find(v => v.id === rental.vehicleId) : null;

        const content = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px;">
                <div>
                    <div style="font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Factura N°</div>
                    <div style="font-size: 20px; font-weight: bold; color: #1f2937;">#${invoice.id.slice(0, 8).toUpperCase()}</div>
                </div>
                <div>
                    <div style="font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Fecha de Emisión</div>
                    <div style="font-size: 16px; color: #1f2937;">${new Date(invoice.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div>
                     <span style="display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: ${invoice.status === 'Pagado' ? '#d1fae5; color: #059669;' :
                invoice.status === 'Parcial' ? '#dbeafe; color: #2563eb;' :
                    '#fef3c7; color: #d97706;'
            }">${invoice.status}</span>
                </div>
            </div>

            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 40px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 10px; letter-spacing: 0.5px;">Facturar a</div>
                <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 5px;">${client?.name || 'Cliente General'}</div>
                <div style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                    DNI: ${client?.dni || 'N/A'}<br>
                    ${client?.address || ''}<br>
                    ${client?.email || ''}
                </div>
            </div>

            <table>
                <thead><tr><th>Descripción</th><th style="text-align: right;">Cant.</th><th style="text-align: right;">Precio</th><th style="text-align: right;">Total</th></tr></thead>
                <tbody>
                    ${rental && vehicle ? `
                    <tr>
                        <td><strong>Renta: ${vehicle.name}</strong><br><span style="font-size: 12px; color: #6b7280;">${new Date(rental.startDate).toLocaleDateString()} - ${rental.endDate ? new Date(rental.endDate).toLocaleDateString() : '...'}</span></td>
                        <td style="text-align: right;">${rental.endDate ? Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 1}</td>
                        <td style="text-align: right;">${formatCurrency(rental.dailyRate)}</td>
                        <td style="text-align: right;">${formatCurrency(invoice.amount)}</td>
                    </tr>
                    ` : `
                    <tr><td><strong>Servicios Varios</strong></td><td style="text-align: right;">1</td><td style="text-align: right;">${formatCurrency(invoice.amount)}</td><td style="text-align: right;">${formatCurrency(invoice.amount)}</td></tr>
                    `}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end;">
                <div style="width: 300px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #4b5563;"><span>Subtotal</span><span>${formatCurrency(invoice.amount)}</span></div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #4b5563;"><span>IVA (21%)</span><span>${formatCurrency(invoice.amount * 0.21)}</span></div>
                    <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 20px; font-weight: 800; color: #1f2937; border-top: 2px solid #e5e7eb; margin-top: 10px;"><span>Total</span><span>${formatCurrency(invoice.amount * 1.21)}</span></div>
                    ${invoice.paidAmount > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #059669; font-weight: 600;"><span>Pagado</span><span>-${formatCurrency(invoice.paidAmount)}</span></div>` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #d97706; font-weight: 700; border-top: 1px dashed #e5e7eb; margin-top: 5px;"><span>Pendiente</span><span>${formatCurrency(invoice.amount * 1.21 - invoice.paidAmount)}</span></div>
                </div>
            </div>
        `;

        const html = generateDocumentHtml("FACTURA", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = invoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
    const paidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    // Group payments by receiptId
    const uniqueReceipts = Array.from(new Set(payments.map(p => p.receiptId))).map(receiptId => {
        const group = payments.filter(p => p.receiptId === receiptId);
        return {
            receiptId,
            date: group[0].date,
            clientId: group[0].clientId,
            amount: group.reduce((sum, p) => sum + p.amount, 0),
            method: group[0].method,
            count: group.length
        };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Facturación</h2>
                    <p className="text-gray-300">Gestiona facturas y pagos.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleOpenPaymentModal()}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    >
                        <CreditCard className="mr-2 h-4 w-4" /> Registrar Pago
                    </Button>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Crear Factura
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Ingresos Totales</CardTitle>
                        <DollarSign className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-gray-400 mt-1">{invoices.length} facturas</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-700 bg-gradient-to-br from-green-900/20 to-gray-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Pagado</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{formatCurrency(paidAmount)}</div>
                        <p className="text-xs text-gray-400 mt-1">{invoices.filter(i => i.status === "Pagado").length} facturas completas</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-700 bg-gradient-to-br from-yellow-900/20 to-gray-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Pendiente</CardTitle>
                        <Clock className="h-5 w-5 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{formatCurrency(pendingAmount)}</div>
                        <p className="text-xs text-gray-400 mt-1">Por cobrar</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700 pb-2">
                <button
                    onClick={() => setActiveTab("invoices")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "invoices" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                >
                    Facturas
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "history" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                >
                    Historial de Pagos
                </button>
            </div>

            {/* Content */}
            {activeTab === "invoices" ? (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Facturas Recientes</h3>
                    <div className="space-y-3">
                        {invoices.map((invoice) => {
                            const client = clients.find((c) => c.id === invoice.clientId);
                            const rental = rentals.find((r) => r.id === invoice.rentalId);
                            const balance = invoice.amount - invoice.paidAmount;

                            return (
                                <Card key={invoice.id} className="border-gray-700 bg-gray-800/50 backdrop-blur hover:bg-gray-800/70 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-4 w-4 text-blue-400" />
                                                        <span className="text-white font-medium">{client?.name}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-mono">#{invoice.id.slice(0, 8)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <Calendar className="h-4 w-4 text-purple-400" />
                                                    {new Date(invoice.date).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {rental ? "Renta automática" : "Factura manual"}
                                                </div>
                                                <div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${invoice.status === 'Pagado'
                                                        ? 'bg-green-600 text-white border-green-500'
                                                        : invoice.status === 'Parcial'
                                                            ? 'bg-blue-600 text-white border-blue-500'
                                                            : 'bg-yellow-600 text-white border-yellow-500'
                                                        }`}>
                                                        {invoice.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-gray-400">Total: <span className="text-white font-bold">{formatCurrency(invoice.amount)}</span></p>
                                                    {invoice.paidAmount > 0 && (
                                                        <>
                                                            <p className="text-green-400">Pagado: {formatCurrency(invoice.paidAmount)}</p>
                                                            {balance > 0 && <p className="text-yellow-400">Saldo: {formatCurrency(balance)}</p>}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() => handlePrintInvoice(invoice.id)}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                                        title="Imprimir factura"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    {invoice.status !== "Pagado" && (
                                                        <Button
                                                            onClick={() => handleOpenPaymentModal(client?.id, invoice.id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <CreditCard className="mr-2 h-4 w-4" /> Pagar
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Historial de Pagos</h3>
                    <div className="space-y-3">
                        {uniqueReceipts.length > 0 ? uniqueReceipts.map((receipt) => {
                            const client = clients.find(c => c.id === receipt.clientId);
                            return (
                                <Card key={receipt.receiptId} className="border-gray-700 bg-gray-800/50 backdrop-blur hover:bg-gray-800/70 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="h-4 w-4 text-green-400" />
                                                        <span className="text-white font-medium">Comprobante</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-mono">#{receipt.receiptId.slice(-8)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <Calendar className="h-4 w-4 text-purple-400" />
                                                    {new Date(receipt.date).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-4 w-4 text-blue-400" />
                                                        <span className="text-white text-sm">{client?.name}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">{receipt.count} factura(s) afectada(s)</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-gray-400">Monto Total</p>
                                                    <p className="text-white font-bold text-lg">{formatCurrency(receipt.amount)}</p>
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    <Button
                                                        onClick={() => handlePrintReceipt(receipt.receiptId)}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <Printer className="mr-2 h-4 w-4" /> Reimprimir
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        }) : (
                            <p className="text-gray-500 text-center py-8">No hay pagos registrados aún.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl border-gray-700 bg-gray-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
                            <CardTitle className="text-white">Registrar Pago - Paso {paymentStep} de 3</CardTitle>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {paymentStep === 1 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-white">Seleccionar Cliente</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {clients.map(client => (
                                            <button
                                                key={client.id}
                                                onClick={() => handleClientSelect(client.id)}
                                                className="p-4 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-left transition-colors"
                                            >
                                                <div className="font-bold text-white">{client.name}</div>
                                                <div className="text-sm text-gray-400">{client.email}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {paymentStep === 2 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-white">Seleccionar Facturas Pendientes</h3>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {invoices.filter(i => i.clientId === selectedClientId && i.status !== 'Pagado').length > 0 ? (
                                            invoices
                                                .filter(i => i.clientId === selectedClientId && i.status !== 'Pagado')
                                                .map(invoice => (
                                                    <div
                                                        key={invoice.id}
                                                        onClick={() => toggleInvoiceSelection(invoice.id)}
                                                        className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center ${selectedInvoiceIds.includes(invoice.id)
                                                            ? 'border-green-500 bg-green-900/20'
                                                            : 'border-gray-700 bg-gray-800'
                                                            }`}
                                                    >
                                                        <div>
                                                            <div className="text-white font-medium">Factura #{invoice.id.slice(0, 8)}</div>
                                                            <div className="text-xs text-gray-400">Fecha: {new Date(invoice.date).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-white font-bold">{formatCurrency(invoice.amount - invoice.paidAmount)}</div>
                                                            <div className="text-xs text-yellow-500">Pendiente</div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="text-gray-400 text-center py-4">Este cliente no tiene facturas pendientes.</p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <label className="text-sm text-gray-300 font-medium">Monto Total a Pagar ($)</label>
                                        <Input
                                            type="number"
                                            value={totalPaymentAmount}
                                            onChange={(e) => setTotalPaymentAmount(e.target.value)}
                                            className="bg-gray-800 border-gray-700 text-white mt-1 text-lg"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentStep === 3 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-white">Confirmar Distribución</h3>
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-400">Monto Total:</span>
                                            <span className="text-white font-bold text-lg">{formatCurrency(parseFloat(totalPaymentAmount))}</span>
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            <p className="text-sm text-gray-400 uppercase font-bold">Se aplicará a:</p>
                                            {allocations.map(alloc => (
                                                <div key={alloc.invoiceId} className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Factura #{alloc.invoiceId.slice(0, 8)}</span>
                                                    <span className="text-green-400 font-mono">+{formatCurrency(alloc.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-300 font-medium">Método de Pago</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white mt-1"
                                        >
                                            <option value="Transferencia">Transferencia Bancaria</option>
                                            <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                                            <option value="Efectivo">Efectivo</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-700 pt-6 flex justify-between">
                            {paymentStep > 1 && (
                                <Button variant="outline" onClick={() => setPaymentStep(prev => prev - 1 as 1 | 2 | 3)} className="text-white border-gray-600">
                                    Atrás
                                </Button>
                            )}
                            <div className="ml-auto">
                                {paymentStep === 1 && (
                                    <Button disabled={!selectedClientId} onClick={() => setPaymentStep(2)} className="bg-blue-600 text-white">
                                        Siguiente
                                    </Button>
                                )}
                                {paymentStep === 2 && (
                                    <Button disabled={selectedInvoiceIds.length === 0 || !totalPaymentAmount} onClick={calculateAllocations} className="bg-blue-600 text-white">
                                        Siguiente
                                    </Button>
                                )}
                                {paymentStep === 3 && (
                                    <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700 text-white">
                                        Confirmar y Pagar
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Add Invoice Modal (Simplified for brevity, keep existing logic) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-gray-700 bg-gray-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
                            <CardTitle className="text-white">Nueva Factura</CardTitle>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Cliente</label>
                                    <select
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white mt-1"
                                        required
                                    >
                                        <option value="">Seleccionar cliente...</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Monto ($)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-700 pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Crear Factura
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
