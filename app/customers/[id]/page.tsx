"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, FileText, Car } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default function ClientHistoryPage() {
    const params = useParams();
    const { clients, rentals, invoices, vehicles } = useData();

    // Ensure params.id is a string
    const clientId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

    const client = clients.find((c) => c.id === clientId);
    const clientRentals = rentals.filter((r) => r.clientId === clientId);
    const clientInvoices = invoices.filter((i) => i.clientId === clientId);

    if (!client) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">Cliente no encontrado</h2>
                <Link href="/settings">
                    <Button variant="outline" className="text-foreground border-border">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Ajustes
                    </Button>
                </Link>
            </div>
        );
    }

    const totalSpent = clientInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const activeRentalsCount = clientRentals.filter(r => r.status === 'Activo').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/settings">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{client.name}</h2>
                    <p className="text-muted-foreground">Historial y detalles del cliente</p>
                </div>
            </div>

            {/* Client Stats & Info */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border bg-card shadow-sm md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xl text-foreground flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Información Personal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="font-bold text-foreground text-xs">DNI</span>
                            </div>
                            <span>{client.dni}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Mail className="h-4 w-4 text-blue-500" />
                            </div>
                            <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Phone className="h-4 w-4 text-green-500" />
                            </div>
                            <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-red-500" />
                            </div>
                            <span>{client.address}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <Car className="h-10 w-10 text-blue-500 mb-2" />
                            <div className="text-3xl font-bold text-foreground">{clientRentals.length}</div>
                            <p className="text-sm text-muted-foreground">Rentas Totales</p>
                            {activeRentalsCount > 0 && (
                                <span className="mt-2 px-2 py-1 bg-green-100/50 text-green-700 text-xs rounded-full border border-green-200">
                                    {activeRentalsCount} Activas
                                </span>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <DollarSign className="h-10 w-10 text-green-500 mb-2" />
                            <div className="text-3xl font-bold text-foreground">{formatCurrency(totalSpent)}</div>
                            <p className="text-sm text-muted-foreground">Total Facturado</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Rentals History */}
            <div>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-500" />
                    Historial de Rentas
                </h3>
                <div className="space-y-3">
                    {clientRentals.length > 0 ? (
                        clientRentals.map((rental) => {
                            const vehicle = vehicles.find((v) => v.id === rental.vehicleId);
                            return (
                                <Card key={rental.id} className="border-border bg-card hover:bg-accent/50 transition-colors shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                                <div>
                                                    <h4 className="font-bold text-foreground">{vehicle?.name || 'Vehículo desconocido'}</h4>
                                                    <p className="text-xs text-muted-foreground">#{rental.id.slice(0, 8)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 text-blue-500" />
                                                    {new Date(rental.startDate).toLocaleDateString()} - {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'En curso'}
                                                </div>
                                                <div>
                                                    <span className={`px-2 py-1 rounded-full text-xs border ${rental.status === 'Activo'
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : 'bg-muted text-muted-foreground border-border'
                                                        }`}>
                                                        {rental.status}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-foreground">{formatCurrency(rental.totalAmount || 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <p className="text-muted-foreground text-center py-4 bg-muted/50 rounded-lg border border-border">No hay rentas registradas</p>
                    )}
                </div>
            </div>

            {/* Invoices History */}
            <div>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Historial de Facturas
                </h3>
                <div className="space-y-3">
                    {clientInvoices.length > 0 ? (
                        clientInvoices.map((invoice) => (
                            <Card key={invoice.id} className="border-border bg-card hover:bg-accent/50 transition-colors shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                            <div>
                                                <h4 className="font-bold text-foreground">Factura #{invoice.id.slice(0, 8)}</h4>
                                                <p className="text-xs text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {invoice.rentalId ? 'Renta de Vehículo' : 'Servicio Manual'}
                                            </div>
                                            <div>
                                                <span className={`px-2 py-1 rounded-full text-xs border ${invoice.status === 'Pagado'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : invoice.status === 'Parcial'
                                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {invoice.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-foreground">{formatCurrency(invoice.amount)}</p>
                                                {invoice.paidAmount < invoice.amount && (
                                                    <p className="text-xs text-yellow-600">Pendiente: {formatCurrency(invoice.amount - invoice.paidAmount)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4 bg-muted/50 rounded-lg border border-border">No hay facturas registradas</p>
                    )}
                </div>
            </div>
        </div>
    );
}
