"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useData, AccountPayable } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Printer, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function ReceiptPage() {
    const params = useParams();
    const router = useRouter();
    const { accountsPayable, companySettings, isLoading } = useData();
    const [receipt, setReceipt] = useState<AccountPayable | null>(null);

    useEffect(() => {
        if (params.id && !isLoading) {
            const found = accountsPayable.find(ap => ap.id === params.id);
            if (found) {
                setReceipt(found);
            } else {
                console.log("Receipt not found for ID:", params.id);
                console.log("Available IDs:", accountsPayable.map(ap => ap.id));
            }
        }
    }, [params.id, accountsPayable, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p>Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
                <p className="text-xl">Comprobante no encontrado.</p>
                <p className="text-gray-400">ID: {params.id}</p>
                <p className="text-xs text-gray-500">
                    Debug info: Loaded {accountsPayable.length} records.
                    {accountsPayable.length > 0 && ` Last ID: ${accountsPayable[accountsPayable.length - 1].id}`}
                </p>
                <Button onClick={() => window.close()} className="bg-gray-700 hover:bg-gray-600">
                    Cerrar Pestaña
                </Button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white text-black p-8">
            {/* Navigation / Actions - Hidden on Print */}
            <div className="print:hidden flex justify-between items-center mb-8 max-w-3xl mx-auto">
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-black">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
                <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                </Button>
            </div>

            {/* Receipt Container */}
            <div className="max-w-3xl mx-auto border border-gray-200 shadow-sm p-12 bg-white print:border-none print:shadow-none print:p-0">

                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                    <div>
                        {companySettings.logo && (
                            <div className="mb-4 relative h-16 w-48">
                                <Image
                                    src={companySettings.logo}
                                    alt="Logo Empresa"
                                    fill
                                    className="object-contain object-left"
                                    unoptimized
                                />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-gray-900">{companySettings.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">{companySettings.address}</p>
                        <p className="text-sm text-gray-500">NIF: {companySettings.taxId}</p>
                        <p className="text-sm text-gray-500">{companySettings.phone} • {companySettings.email}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Comprobante de Pago</h2>
                        <p className="text-sm text-gray-500 mt-2">ID Transacción</p>
                        <p className="font-mono font-medium text-gray-700">#{receipt.id.slice(-8).toUpperCase()}</p>

                        <p className="text-sm text-gray-500 mt-4">Fecha de Emisión</p>
                        <p className="font-medium text-gray-700">{new Date(receipt.date).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Beneficiary Info */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pagado A (Beneficiario)</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{receipt.beneficiaryName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Tipo: <span className="font-medium">{receipt.type}</span>
                        </p>
                        {receipt.beneficiaryDni && (
                            <p className="text-sm text-gray-600">DNI/NIF: {receipt.beneficiaryDni}</p>
                        )}
                    </div>
                </div>

                {/* Details Table */}
                <div className="mb-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-2 font-semibold text-gray-600 text-sm">Concepto / Referencia</th>
                                <th className="py-2 font-semibold text-gray-600 text-sm text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-4 text-gray-800">
                                    Pago por servicio de alquiler / comisión
                                    <br />
                                    <span className="text-sm text-gray-500">Ref. Renta: {receipt.rentalId}</span>
                                </td>
                                <td className="py-4 text-gray-900 font-bold text-right">
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'XAF' }).format(receipt.amount).replace("XAF", "FCFA")}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="py-4 text-right font-bold text-gray-900 text-lg">Total Pagado</td>
                                <td className="py-4 text-right font-bold text-gray-900 text-lg">
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'XAF' }).format(receipt.amount).replace("XAF", "FCFA")}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Signature Section */}
                <div className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-2 gap-12">
                    <div>
                        <div className="h-24 border-b border-dashed border-gray-300 mb-2"></div>
                        <p className="text-center text-sm font-medium text-gray-500">Firma Autorizada</p>
                        <p className="text-center text-xs text-gray-400">{companySettings.name}</p>
                    </div>
                    <div>
                        <div className="h-24 border-b border-dashed border-gray-300 mb-2"></div>
                        <p className="text-center text-sm font-medium text-gray-500">Recibí Conforme</p>
                        <p className="text-center text-xs text-gray-400">{receipt.beneficiaryName}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-gray-400">
                    <p>Este documento es un comprobante de pago válido emitido por {companySettings.name}.</p>
                </div>

            </div>
        </div>
    );
}
