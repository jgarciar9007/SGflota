"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, Phone, Mail, MapPin, Calendar, Car } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

// Mock Badge if not exists, but usually provided in shadcn
// I will just use a span with classes locally if needed, but let's try to simple use divs if unsure.

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

export default function RequestsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [requests, setRequests] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [contacts, setContacts] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState("reservas");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [reqRes, contactRes] = await Promise.all([
                fetch('/api/requests'),
                fetch('/api/contact')
            ]);

            if (reqRes.ok) setRequests(await reqRes.json());
            if (contactRes.ok) setContacts(await contactRes.json());

        } catch (error) {
            console.error(error);
            toast.error("Error cargando datos");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'Aceptado' | 'Rechazado') => {
        try {
            const res = await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success(`Solicitud ${status === 'Aceptado' ? 'aceptada' : 'rechazada'}`);
                fetchData();
            } else {
                throw new Error('Error updating');
            }
        } catch {
            toast.error("Error actualizando estado");
        }
    };

    const handleContactStatus = async (id: string, status: 'Atendido') => {
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success("Mensaje marcado como atendido");
                fetchData();
            } else {
                throw new Error('Error updating');
            }
        } catch {
            toast.error("Error actualizando estado");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Solicitudes</h1>
                <p className="text-muted-foreground">Administra las reservas y mensajes de contacto.</p>
            </div>

            <Tabs className="w-full" value={currentTab}>
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="reservas" activeValue={currentTab} onValueChange={setCurrentTab}>Reservas</TabsTrigger>
                    <TabsTrigger value="contactos" activeValue={currentTab} onValueChange={setCurrentTab}>Mensajes de Contacto</TabsTrigger>
                </TabsList>

                {/* Reservas Tab */}
                <TabsContent value="reservas" activeValue={currentTab} className="mt-6">
                    {isLoading ? (
                        <div className="flex justify-center p-8">Cargando...</div>
                    ) : requests.length === 0 ? (
                        <div className="text-center p-12 border rounded-lg bg-slate-50">
                            <p className="text-slate-500">No hay solicitudes de reserva pendientes.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {requests.map(req => {
                                const services = req.services ? JSON.parse(req.services) : {};
                                return (
                                    <Card key={req.id} className={`overflow-hidden ${req.status !== 'Pendiente' ? 'opacity-60' : ''}`}>
                                        <div className="flex flex-col md:flex-row border-l-4 border-blue-600">
                                            <div className="p-6 flex-1 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                                            {req.clientName}
                                                            {req.status === 'Pendiente' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Pendiente</span>}
                                                            {req.status === 'Aceptado' && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Aceptado</span>}
                                                            {req.status === 'Rechazado' && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Rechazado</span>}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                                            <span className="flex items-center gap-1"><Mail size={14} /> {req.clientEmail}</span>
                                                            <span className="flex items-center gap-1"><Phone size={14} /> {req.clientPhone}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-slate-500">Solicitado el {format(new Date(req.createdAt), 'dd/MM/yyyy')}</div>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                                                    <div>
                                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Car size={16} /> Vehículo Solicitado</h4>
                                                        <p className="text-lg font-medium">{req.vehicle ? req.vehicle.name : req.vehicleName || 'Desconocido'}</p>
                                                        {req.vehicle && <p className="text-sm text-slate-500">{req.vehicle.plate}</p>}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Calendar size={16} /> Fechas</h4>
                                                        <div className="flex gap-4">
                                                            <div>
                                                                <span className="text-xs text-slate-500 block">Inicio</span>
                                                                <span className="font-medium">{format(new Date(req.startDate), 'dd MMM yyyy')}</span>
                                                            </div>
                                                            {req.endDate && (
                                                                <div>
                                                                    <span className="text-xs text-slate-500 block">Fin</span>
                                                                    <span className="font-medium">{format(new Date(req.endDate), 'dd MMM yyyy')}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {req.clientAddress && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <MapPin size={16} /> {req.clientAddress}
                                                    </div>
                                                )}

                                                <div className="flex gap-2 text-sm">
                                                    {services.withDriver && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Con Chofer</span>}
                                                    {services.fuel && <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Combustible</span>}
                                                    {services.tolls && <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded">Peajes</span>}
                                                </div>
                                            </div>

                                            {req.status === 'Pendiente' && (
                                                <div className="bg-slate-50 p-6 flex flex-row md:flex-col justify-center items-center gap-4 border-t md:border-t-0 md:border-l">
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleUpdateStatus(req.id, 'Aceptado')}
                                                    >
                                                        <Check className="mr-2 h-4 w-4" /> Aceptar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300"
                                                        onClick={() => handleUpdateStatus(req.id, 'Rechazado')}
                                                    >
                                                        <X className="mr-2 h-4 w-4" /> Denegar
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Contactos Tab */}
                <TabsContent value="contactos" activeValue={currentTab} className="mt-6">
                    {isLoading ? (
                        <div className="flex justify-center p-8">Cargando...</div>
                    ) : contacts.length === 0 ? (
                        <div className="text-center p-12 border rounded-lg bg-slate-50">
                            <p className="text-slate-500">No hay mensajes de contacto.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {contacts.map(msg => (
                                <Card key={msg.id} className={`p-6 ${msg.status === 'Atendido' ? 'opacity-60 bg-slate-50' : ''}`}>
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">{msg.name}</h3>
                                                {msg.status === 'Pendiente' ? (
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Nuevo</span>
                                                ) : (
                                                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">Atendido</span>
                                                )}
                                                <span className="text-xs text-slate-400">{format(new Date(msg.createdAt), 'dd MMM yyyy HH:mm')}</span>
                                            </div>
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Mail size={14} /> {msg.email}</span>
                                                <span className="flex items-center gap-1"><Phone size={14} /> {msg.phone}</span>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-md border text-slate-700 mt-2">
                                                {msg.message}
                                            </div>
                                        </div>

                                        {msg.status === 'Pendiente' && (
                                            <div className="flex items-start">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleContactStatus(msg.id, 'Atendido')}
                                                >
                                                    <Check className="mr-2 h-4 w-4" /> Marcar como Atendido
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
