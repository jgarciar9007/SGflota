"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DollarSign, Calendar, User, CheckCircle, Plus, X, Printer, CreditCard, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

import { generateDocumentHtml } from "@/lib/reportUtils";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function BillingPage() {
    const { invoices, clients, rentals, vehicles, companySettings, addInvoice, addPayment, payments, refunds, updateRefund, accountsPayable, updateAccountPayable, expenseCategories } = useData();
    const [activeTab, setActiveTab] = useState<"invoices" | "history" | "refunds" | "payables">("invoices");
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
        date: new Date().toISOString().split('T')[0],
        items: [] as { description: string; quantity: number; price: number }[],
    });


    // Temporary state for new item input
    const [newItem, setNewItem] = useState({ description: "", quantity: 1, price: "" });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmText?: string;
        variant?: "danger" | "success" | "info";
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
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
        const isSelected = selectedInvoiceIds.includes(invoiceId);
        const newSelection = isSelected
            ? selectedInvoiceIds.filter(id => id !== invoiceId)
            : [...selectedInvoiceIds, invoiceId];

        setSelectedInvoiceIds(newSelection);

        // Auto-fill amount with the sum of pending balances of selected invoices
        const selectedInvoices = invoices.filter(inv => newSelection.includes(inv.id));
        const totalPending = selectedInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
        // Format with spaces
        setTotalPaymentAmount(totalPending > 0 ? Math.round(totalPending).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "");
    };

    const calculateAllocations = () => {

        // Remove spaces before parsing
        const amount = parseFloat(totalPaymentAmount.replace(/\s/g, ''));
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

    const handleConfirmPayment = async () => {
        if (allocations.length === 0) return;

        const receiptId = await addPayment(selectedClientId, allocations, paymentMethod);

        // Generate receipt
        setTimeout(() => {
            handlePrintReceipt(receiptId);
        }, 100);

        setShowPaymentModal(false);
    };

    // --- Invoice Creation Logic ---

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        if (totalAmount <= 0) {
            toast.error("El monto total debe ser mayor a 0");
            return;
        }

        setIsSubmitting(true);
        try {
            await addInvoice({
                clientId: formData.clientId,
                rentalId: null as unknown as string, // Force null to handle optional relation correctly
                amount: Math.round(totalAmount * 1.15), // Apply 15% VAT (IVA)
                date: new Date(formData.date).toISOString(), // Use selected date
                rentalDetails: {
                    items: formData.items
                }
            });
            toast.success("Factura creada correctamente");
            setShowAddModal(false);
            setFormData({
                clientId: "",
                date: new Date().toISOString().split('T')[0],
                items: [],
            });
        } catch (error) {
            console.error("Error creating invoice:", error);
            toast.error("Error al crear la factura");
        } finally {
            setIsSubmitting(false);
        }
    };

    const addItem = () => {
        const numericPrice = parseFloat(newItem.price.replace(/\s/g, ''));
        if (!newItem.description || isNaN(numericPrice) || numericPrice <= 0) return;

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...newItem, price: numericPrice }]
        }));
        setNewItem({ description: "", quantity: 1, price: "" });
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
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
            <div style="background: white; border: 2px solid #059669; color: #1f2937; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 40px;">
                <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 5px;">Monto Recibido</div>
                <div style="font-size: 42px; font-weight: 800; color: #059669;">${formatCurrency(totalAmount)}</div>
                <div style="font-size: 14px; margin-top: 5px; color: #374151;">Método: ${method}</div>
                <div style="font-size: 12px; margin-top: 5px; color: #6b7280;">N° ${firstPayment.paymentNumber || receiptId.slice(-8)} • ${new Date(paymentDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
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
                            <td>${inv ? (inv.invoiceNumber || '#' + inv.id.slice(0, 8)) : '#' + p.invoiceId.slice(0, 8)}</td>
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
                    <div style="font-size: 20px; font-weight: bold; color: #1f2937;">${invoice.invoiceNumber || '#' + invoice.id.slice(0, 8).toUpperCase()}</div>
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
                    ` : invoice.rentalDetails && invoice.rentalDetails.items ?
                invoice.rentalDetails.items.map((item: { description: string; quantity: number; price: number }) => `
                        <tr>
                            <td>${item.description}</td>
                            <td style="text-align: right;">${item.quantity}</td>
                            <td style="text-align: right;">${formatCurrency(item.price)}</td>
                            <td style="text-align: right;">${formatCurrency(item.quantity * item.price)}</td>
                        </tr>
                        `).join('')
                : `
                    <tr><td><strong>Servicios Varios</strong></td><td style="text-align: right;">1</td><td style="text-align: right;">${formatCurrency(invoice.amount)}</td><td style="text-align: right;">${formatCurrency(invoice.amount)}</td></tr>
                    `}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end;">
                <div style="width: 300px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #4b5563;"><span>Subtotal</span><span>${formatCurrency(invoice.amount / 1.15)}</span></div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #4b5563;"><span>IVA (15%)</span><span>${formatCurrency(invoice.amount - (invoice.amount / 1.15))}</span></div>
                    <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 20px; font-weight: 800; color: #1f2937; border-top: 2px solid #e5e7eb; margin-top: 10px;"><span>Total</span><span>${formatCurrency(invoice.amount)}</span></div>
                    ${invoice.paidAmount > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #059669; font-weight: 600;"><span>Pagado</span><span>-${formatCurrency(invoice.paidAmount)}</span></div>` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #d97706; font-weight: 700; border-top: 1px dashed #e5e7eb; margin-top: 5px;"><span>Pendiente</span><span>${formatCurrency(invoice.amount - invoice.paidAmount)}</span></div>
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

    const handlePrintRefund = (refundId: string) => {
        const refund = refunds.find(r => r.id === refundId);
        if (!refund) return;

        const client = clients.find(c => c.id === refund.clientId);

        const content = `
            <div style="background: white; border: 2px solid #b91c1c; color: #1f2937; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 40px;">
                <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 5px;">Reembolso Emitido</div>
                <div style="font-size: 42px; font-weight: 800; color: #b91c1c;">${formatCurrency(refund.amount)}</div>
                <div style="font-size: 14px; margin-top: 5px; color: #374151;">Motivo: ${refund.reason.replace("[Reembolsado] ", "")}</div>
                <div style="font-size: 12px; margin-top: 5px; color: #6b7280;">Ref N° ${refund.refundNumber || refund.id.slice(-8)} • ${new Date(refund.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Beneficiario</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">Nombre:</span><span style="font-weight: 600; color: #1f2937;">${client?.name || 'N/A'}</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">DNI/NIF:</span><span style="font-weight: 600; color: #1f2937;">${client?.dni || 'N/A'}</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">Asociado a Factura:</span><span style="font-weight: 600; color: #1f2937;">${(invoices.find(i => i.id === refund.invoiceId)?.invoiceNumber) || '#' + refund.invoiceId.slice(0, 8)}</span></div>
            </div>
        `;

        const html = generateDocumentHtml("Comprobante de Reembolso", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const handlePrintPayableReceipt = (payableId: string) => {
        const payable = accountsPayable.find(ap => ap.id === payableId);
        if (!payable) return;

        const associatedRental = rentals.find(r => r.id === payable.rentalId);
        const vehicle = associatedRental ? vehicles.find(v => v.id === associatedRental.vehicleId) : null;

        const content = `
        <div style="background: white; border: 2px solid #4f46e5; color: #1f2937; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 40px;">
            <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 5px;">Comprobante de Pago a Tercero</div>
            <div style="font-size: 42px; font-weight: 800; color: #4f46e5;">${formatCurrency(payable.amount)}</div>
            <div style="font-size: 14px; margin-top: 5px; color: #374151;">Concepto: ${payable.type}</div>
            <div style="font-size: 12px; margin-top: 5px; color: #6b7280;">Ref N° ${payable.id.slice(-8)} • ${new Date(payable.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Información del Beneficiario</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">Beneficiario:</span><span style="font-weight: 600; color: #1f2937;">${payable.beneficiaryName}</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">DNI/NIF:</span><span style="font-weight: 600; color: #1f2937;">${payable.beneficiaryDni || 'N/A'}</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;"><span style="color: #6b7280;">Tipo:</span><span style="font-weight: 600; color: #1f2937;">${payable.type}</span></div>
            </div>

             <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Detalle del Concepto</div>
                ${associatedRental ? `
                <div style="margin-bottom: 10px;">
                    <span style="font-weight: 600; color: #1f2937;">Renta Asociada:</span> <span style="color: #4b5563;">#${associatedRental.id.slice(-8)}</span>
                </div>
                ${vehicle ? `
                <div style="margin-bottom: 10px;">
                    <span style="font-weight: 600; color: #1f2937;">Vehículo:</span> <span style="color: #4b5563;">${vehicle.name} (${vehicle.plate})</span>
                </div>
                ` : ''}
                <div style="margin-bottom: 10px;">
                    <span style="font-weight: 600; color: #1f2937;">Periodo:</span> <span style="color: #4b5563;">${new Date(associatedRental.startDate).toLocaleDateString()} - ${new Date(associatedRental.endDate).toLocaleDateString()}</span>
                </div>
                ` : `
                <div style="color: #4b5563;">Pago directo a beneficiario sin renta asociada específica.</div>
                `}
            </div>
            
            <div style="background: #f0fdf4; border: 1px dashed #16a34a; padding: 15px; border-radius: 8px; text-align: center; color: #15803d; font-size: 14px; font-weight: 600;">
                Documento de Control Interno - Pagado
            </div>
        `;

        const html = generateDocumentHtml("Comprobante de Pago", companySettings, content);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    const paidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    const totalPayable = accountsPayable.reduce((sum, ap) => (ap.status === "Pendiente" || ap.status === "Retenido") ? sum + ap.amount : sum, 0);

    // Group payments by receiptId
    const uniqueReceipts = Array.from(new Set(payments.map(p => p.receiptId))).map(receiptId => {
        const group = payments.filter(p => p.receiptId === receiptId);
        return {
            receiptId,
            date: group[0].date,
            clientId: group[0].clientId,
            amount: group.reduce((sum, p) => sum + p.amount, 0),
            method: group[0].method,
            count: group.length,
            paymentNumber: group[0].paymentNumber
        };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Facturación</h2>
                    <p className="text-muted-foreground">Gestiona facturas, pagos y reembolsos.</p>
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
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{invoices.length} facturas</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pagado</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{formatCurrency(paidAmount)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.status === "Pagado").length} facturas completas</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Reembolsos</CardTitle>
                        <FileText className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{formatCurrency(refunds.filter(r => !r.reason.startsWith("[Reembolsado]")).reduce((sum, r) => sum + r.amount, 0))}</div>
                        <p className="text-xs text-muted-foreground mt-1">{refunds.filter(r => !r.reason.startsWith("[Reembolsado]")).length} devoluciones pendientes</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cuentas por Pagar</CardTitle>
                        <DollarSign className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{formatCurrency(totalPayable)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{accountsPayable.filter(ap => ap.status === "Pendiente" || ap.status === "Retenido").length} pendientes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-border pb-2">
                <button
                    onClick={() => setActiveTab("invoices")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "invoices" ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Facturas
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "history" ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Historial de Pagos
                </button>
                <button
                    onClick={() => setActiveTab("refunds")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "refunds" ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Reembolsos
                </button>
                <button
                    onClick={() => setActiveTab("payables")}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "payables" ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Cuentas por Pagar
                </button>
            </div>

            {/* Content */}
            {activeTab === "invoices" && (
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Facturas Recientes</h3>
                    <div className="space-y-3">
                        {invoices.length > 0 ? invoices.map((invoice) => {
                            const client = clients.find((c) => c.id === invoice.clientId);
                            const rental = rentals.find((r) => r.id === invoice.rentalId);
                            const vehicle = rental ? vehicles.find(v => v.id === rental.vehicleId) : null;
                            const balance = invoice.amount - invoice.paidAmount;

                            return (
                                <Card key={invoice.id} className="border-border bg-card hover:bg-accent/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                        <span className="text-foreground font-medium">{client?.name}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-mono">{invoice.invoiceNumber || `#${invoice.id.slice(0, 8)}`}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 text-purple-600" />
                                                    {new Date(invoice.date).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {rental ? (
                                                        <>
                                                            <div>Renta: {vehicle?.name}</div>
                                                            {invoice.rentalDetails && invoice.rentalDetails.startDate ? (
                                                                <div className="text-muted-foreground mt-1">
                                                                    {new Date(invoice.rentalDetails.startDate).toLocaleDateString()} - {invoice.rentalDetails.endDate ? new Date(invoice.rentalDetails.endDate).toLocaleDateString() : '...'}
                                                                    <span className="ml-1 font-bold">({invoice.rentalDetails.days} días)</span>
                                                                </div>
                                                            ) : invoice.rentalDetails && invoice.rentalDetails.note ? (
                                                                <div className="text-muted-foreground mt-1 italic">
                                                                    {invoice.rentalDetails.note}
                                                                </div>
                                                            ) : (
                                                                <div className="text-muted-foreground text-xs italic">Ver detalle en factura impresa</div>
                                                            )}
                                                        </>
                                                    ) : "Factura manual"}
                                                </div>
                                                <div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${invoice.status === 'Pagado'
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : invoice.status === 'Parcial'
                                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                        }`}>
                                                        {invoice.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground">Total: <span className="text-foreground font-bold">{formatCurrency(invoice.amount)}</span></p>
                                                    {invoice.paidAmount > 0 && (
                                                        <>
                                                            <p className="text-green-600">Pagado: {formatCurrency(invoice.paidAmount)}</p>
                                                            {balance > 0 && <p className="text-yellow-600">Saldo: {formatCurrency(balance)}</p>}
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
                        }) : (
                            <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed border-border mx-auto max-w-2xl">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">No hay facturas registradas</h3>
                                <p className="text-muted-foreground mb-6">Crea una nueva factura manual o genera una desde una renta.</p>
                                <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
                                    <Plus className="mr-2 h-4 w-4" /> Crear Factura
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "history" && (
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Historial de Pagos</h3>
                    <div className="space-y-3">
                        {uniqueReceipts.length > 0 ? uniqueReceipts.map((receipt) => {
                            const client = clients.find(c => c.id === receipt.clientId);
                            return (
                                <Card key={receipt.receiptId} className="border-border bg-card hover:bg-accent/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="h-4 w-4 text-green-600" />
                                                        <span className="text-foreground font-medium">Comprobante</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-mono">{receipt.paymentNumber || `#${receipt.receiptId.slice(-8)}`}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 text-purple-600" />
                                                    {new Date(receipt.date).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                        <span className="text-foreground text-sm">{client?.name}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{receipt.count} factura(s) afectada(s)</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground">Monto Total</p>
                                                    <p className="text-foreground font-bold text-lg">{formatCurrency(receipt.amount)}</p>
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
                            <p className="text-muted-foreground text-center py-8">No hay pagos registrados aún.</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "refunds" && (
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Reembolsos & Devoluciones</h3>
                    <div className="space-y-3">
                        {refunds.length > 0 ? refunds.map((refund) => {
                            const client = clients.find(c => c.id === refund.clientId);
                            const isReimbursed = refund.reason.startsWith("[Reembolsado]");
                            const displayStatus = isReimbursed ? "Reembolsado" : "Pendiente";
                            const cleanReason = refund.reason.replace("[Reembolsado] ", "");

                            return (
                                <Card key={refund.id} className="border-border bg-card hover:bg-accent/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="h-4 w-4 text-red-600" />
                                                        <span className="text-foreground font-medium">Reembolso</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-mono">{refund.refundNumber || `#${refund.id.slice(-8)}`}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 text-purple-600" />
                                                    {new Date(refund.date).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                        <span className="text-foreground text-sm">{client?.name}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={cleanReason}>{cleanReason}</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground">Monto</p>
                                                    <p className="text-red-600 font-bold text-lg">{formatCurrency(refund.amount)}</p>
                                                </div>
                                                <div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${!isReimbursed ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                        {displayStatus}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    {!isReimbursed && (
                                                        <Button
                                                            onClick={() => {
                                                                setConfirmModal({
                                                                    isOpen: true,
                                                                    title: "Confirmar Reembolso",
                                                                    description: `¿Estás seguro de que deseas confirmar el reembolso de ${formatCurrency(refund.amount)}? Esta acción es irreversible.`,
                                                                    confirmText: "Sí, Reembolsar",
                                                                    variant: "danger",
                                                                    onConfirm: async () => {
                                                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                        try {
                                                                            const loading = toast.loading("Procesando reembolso...");
                                                                            await updateRefund(refund.id, { status: "Reembolsado", reason: "[Reembolsado] " + refund.reason });
                                                                            toast.dismiss(loading);
                                                                            toast.success("Reembolso registrado");
                                                                        } catch (e) {
                                                                            console.error(e);
                                                                            toast.error("Error al registrar reembolso");
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            size="sm"
                                                        >
                                                            Reembolsar
                                                        </Button>
                                                    )}
                                                    <Button
                                                        onClick={() => handlePrintRefund(refund.id)}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                                                        size="sm"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        }) : (
                            <p className="text-gray-500 text-center py-8">No hay reembolsos registrados.</p>
                        )}
                    </div>
                </div>
            )
            }

            {
                activeTab === "payables" && (
                    <div>
                        {/* Payables Summary by Beneficiary */}
                        <h3 className="text-xl font-bold text-foreground mb-4">Resumen por Beneficiario (Pendiente)</h3>
                        <div className="grid gap-4 md:grid-cols-3 mb-8">
                            {Object.entries((accountsPayable || [])
                                .filter(ap => ap && ap.status === "Pendiente")
                                .reduce((acc, ap) => {
                                    const name = ap.beneficiaryName || 'Sin Nombre';
                                    if (!acc[name]) {
                                        acc[name] = { amount: 0, count: 0, type: ap.type || 'Desconocido' };
                                    }
                                    acc[name].amount += (ap.amount || 0);
                                    acc[name].count += 1;
                                    return acc;
                                }, {} as Record<string, { amount: number, count: number, type: string }>)
                            ).map(([name, data]) => (
                                <Card key={name} className="border-border bg-card">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-foreground text-lg">{name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${data.type === 'Propietario' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {data.type}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-foreground">{formatCurrency(data.amount)}</p>
                                                <p className="text-xs text-muted-foreground">{data.count} registro(s)</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-4">Detalle de Cuentas por Pagar (Comisiones y Terceros)</h3>
                        <div className="space-y-3">
                            {accountsPayable && accountsPayable.length > 0 ? accountsPayable.filter(ap => ap && ap.status === "Pendiente").map((ap) => {
                                const associatedRental = rentals ? rentals.find(r => r && r.id === ap.rentalId) : null;
                                const vehicle = associatedRental && vehicles ? vehicles.find(v => v && v.id === associatedRental.vehicleId) : null;

                                return (
                                    <Card key={ap.id || Math.random()} className="border-border bg-card hover:bg-accent/50 transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FileText className="h-4 w-4 text-purple-600" />
                                                            <span className="text-foreground font-medium">{ap.type || 'Desconocido'}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-mono">Ref: {associatedRental && associatedRental.id ? `Renta #${String(associatedRental.id).slice(-6)}` : 'N/A'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                        {ap.beneficiaryName || 'Sin Nombre'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {vehicle ? vehicle.name : 'N/A'}
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="text-muted-foreground">Monto a Pagar</p>
                                                        <p className="text-foreground font-bold text-lg">{formatCurrency(ap.amount)}</p>
                                                    </div>
                                                    <div className="flex items-center justify-end">
                                                        <Button
                                                            onClick={() => {
                                                                setConfirmModal({
                                                                    isOpen: true,
                                                                    title: "Confirmar Pago",
                                                                    description: `¿Estás a punto de registrar un pago de ${formatCurrency(ap.amount)} a ${ap.beneficiaryName}. ¿Deseas continuar?`,
                                                                    confirmText: "Pagar",
                                                                    variant: "success",
                                                                    onConfirm: async () => {
                                                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                        try {
                                                                            const loadingToast = toast.loading("Procesando pago...");
                                                                            await updateAccountPayable(ap.id, { status: "Pagado" });
                                                                            toast.dismiss(loadingToast);
                                                                            toast.success("Pago registrado correctamente");
                                                                            // Short delay to allow state update before print
                                                                            setTimeout(() => handlePrintPayableReceipt(ap.id), 500);
                                                                        } catch (error) {
                                                                            console.error("Error updating payable:", error);
                                                                            toast.error("Error al registrar el pago");
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <CreditCard className="mr-2 h-4 w-4" /> Pagar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }) : (
                                <p className="text-gray-500 text-center py-8">No hay cuentas por pagar pendientes.</p>
                            )}

                            <h4 className="text-lg font-bold text-foreground mt-8 mb-4">Historial de Pagos a Terceros</h4>
                            {accountsPayable.filter(ap => ap.status === "Pagado").length > 0 ? (
                                <div className="space-y-3 opacity-75">
                                    {accountsPayable.filter(ap => ap.status === "Pagado").map((ap) => (
                                        <div key={ap.id} className="p-4 border border-border rounded-lg bg-muted/50 flex justify-between items-center">
                                            <div>
                                                <p className="text-foreground font-medium">{ap.beneficiaryName} ({ap.type})</p>
                                                <p className="text-xs text-muted-foreground">Pagado el {new Date(ap.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-green-600 font-bold">{formatCurrency(ap.amount)}</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePrintPayableReceipt(ap.id)}
                                                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No hay historial de pagos.</p>
                            )}
                        </div>
                    </div>
                )
            }

            {
                showPaymentModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-2xl border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                                <CardTitle className="text-foreground">Registrar Pago</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                {paymentStep === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-foreground">Seleccionar Cliente</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {clients.map(client => {
                                                const clientInvoices = invoices.filter(inv => inv.clientId === client.id && inv.status !== "Pagado");
                                                const totalPending = clientInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

                                                if (totalPending <= 0) return null;

                                                return (
                                                    <div
                                                        key={client.id}
                                                        onClick={() => handleClientSelect(client.id)}
                                                        className="p-4 border border-border rounded-lg bg-card hover:bg-accent cursor-pointer transition-colors"
                                                    >
                                                        <div className="font-bold text-foreground">{client.name}</div>
                                                        <div className="text-sm text-muted-foreground">{client.email}</div>
                                                        <div className="mt-2 text-yellow-600 font-bold">Por pagar: {formatCurrency(totalPending)}</div>
                                                        <div className="text-xs text-muted-foreground">{clientInvoices.length} facturas pendientes</div>
                                                    </div>
                                                );
                                            })}
                                            {clients.every(c => invoices.every(i => i.clientId !== c.id || i.status === "Pagado")) && (
                                                <div className="col-span-2 text-center text-muted-foreground py-4">No hay clientes con deuda pendiente.</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {paymentStep === 2 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-foreground">Seleccionar Facturas</h3>
                                            <Button variant="outline" size="sm" onClick={() => setPaymentStep(1)}>Cambiar Cliente</Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Cliente: <span className="text-foreground font-bold">{clients.find(c => c.id === selectedClientId)?.name}</span></p>

                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                            {invoices
                                                .filter(inv => inv.clientId === selectedClientId && inv.status !== "Pagado")
                                                .map(invoice => (
                                                    <div
                                                        key={invoice.id}
                                                        onClick={() => toggleInvoiceSelection(invoice.id)}
                                                        className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${selectedInvoiceIds.includes(invoice.id)
                                                            ? "border-green-600 bg-green-100"
                                                            : "border-border bg-card hover:bg-accent"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedInvoiceIds.includes(invoice.id) ? "bg-green-600 border-green-600" : "border-muted-foreground"
                                                                }`}>
                                                                {selectedInvoiceIds.includes(invoice.id) && <CheckCircle className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-foreground max-w-[200px] truncate">Factura #{invoice.id.slice(0, 8)}</div>
                                                                <div className="text-xs text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-foreground">{formatCurrency(invoice.amount)}</div>
                                                            <div className="text-xs text-yellow-600">Pendiente: {formatCurrency(invoice.amount - invoice.paidAmount)}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>

                                        <div className="pt-4 border-t border-border">
                                            <label className="text-sm text-muted-foreground block mb-2">Monto a Pagar</label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    value={totalPaymentAmount}
                                                    onChange={(e) => {
                                                        // Remove non-numeric characters
                                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                        // Format with spaces
                                                        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                        setTotalPaymentAmount(formatted);
                                                    }}
                                                    placeholder="Ingrese monto total"
                                                    className="bg-background border-input text-foreground text-lg pr-12"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">FCFA</span>
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <Button
                                                    onClick={calculateAllocations}
                                                    disabled={!totalPaymentAmount || parseFloat(totalPaymentAmount.replace(/\s/g, '')) <= 0 || selectedInvoiceIds.length === 0}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    Continuar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentStep === 3 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-foreground">Confirmar Distribución</h3>
                                        <div className="bg-muted p-4 rounded-lg border border-border space-y-2">
                                            <div className="flex justify-between text-sm text-muted-foreground border-b border-border pb-2">
                                                <span>Factura</span>
                                                <span>Aplicado</span>
                                            </div>
                                            {allocations.map(alloc => (
                                                <div key={alloc.invoiceId} className="flex justify-between text-foreground">
                                                    <span>#{alloc.invoiceId.slice(0, 8)}</span>
                                                    <span className="font-bold text-green-600">{formatCurrency(alloc.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2 mt-2">
                                                <span>Total</span>
                                                <span>{formatCurrency(allocations.reduce((sum, a) => sum + a.amount, 0))}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm text-muted-foreground block mb-2">Método de Pago</label>
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full bg-background border-input rounded-md p-2 text-foreground"
                                            >
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Transferencia">Transferencia Bancaria</option>
                                                <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                                                <option value="Cheque">Cheque</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="ghost" onClick={() => setPaymentStep(2)} className="text-muted-foreground hover:text-foreground">Volver</Button>
                                            <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700 text-white">
                                                Confirmar y Emitir Recibo
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-4xl border-border bg-card shadow-lg h-[90vh] flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                                <CardTitle className="text-foreground">Nueva Factura</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Cliente</label>
                                        <select
                                            className="w-full mt-1 bg-background border-input rounded-md p-2 text-foreground border"
                                            value={formData.clientId}
                                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        >
                                            <option value="">Seleccione un cliente</option>
                                            {clients.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Fecha de Emisión</label>
                                        <Input
                                            type="date"
                                            className="mt-1 bg-background border-input text-foreground"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="border border-border rounded-lg overflow-hidden mb-6">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted text-muted-foreground">
                                            <tr>
                                                <th className="p-3 text-left">Descripción / Concepto</th>
                                                <th className="p-3 text-right w-24">Cant.</th>
                                                <th className="p-3 text-right w-40">Precio Unit.</th>
                                                <th className="p-3 text-right w-40">Total</th>
                                                <th className="p-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {formData.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-3 text-foreground">{item.description}</td>
                                                    <td className="p-3 text-right text-foreground">{item.quantity}</td>
                                                    <td className="p-3 text-right text-foreground">{formatCurrency(item.price)}</td>
                                                    <td className="p-3 text-right font-medium text-foreground">{formatCurrency(item.quantity * item.price)}</td>
                                                    <td className="p-3 text-center">
                                                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-muted/30">
                                                <td className="p-2">
                                                    <div className="relative">
                                                        <input
                                                            list="expense-types"
                                                            placeholder="Descripción o Seleccionar Tipo..."
                                                            value={newItem.description}
                                                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                        <datalist id="expense-types">
                                                            {expenseCategories.map(cat => (
                                                                <option key={cat.id} value={cat.name} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={newItem.quantity}
                                                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                                                        className="bg-background border-input text-right"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <div className="relative">
                                                        <Input
                                                            type="text"
                                                            value={newItem.price}
                                                            onChange={(e) => {
                                                                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                                const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                                                setNewItem({ ...newItem, price: formatted });
                                                            }}
                                                            className="bg-background border-input text-right pr-12"
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">FCFA</span>
                                                    </div>
                                                </td>
                                                <td className="p-2 text-right font-medium text-muted-foreground">
                                                    {formatCurrency(newItem.quantity * (parseFloat(newItem.price.replace(/\s/g, '')) || 0))}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Button size="sm" onClick={addItem} disabled={!newItem.description || (parseFloat(newItem.price.replace(/\s/g, '')) || 0) <= 0} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end items-center gap-4 border-t border-border pt-4">
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Total Factura</div>
                                        <div className="text-3xl font-bold text-foreground">
                                            {formatCurrency(formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!formData.clientId || formData.items.length === 0 || isSubmitting}
                                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg px-8 h-12 text-lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Creando...
                                            </>
                                        ) : (
                                            "Guardar y Crear Factura"
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
            />
        </div >
    );
}
