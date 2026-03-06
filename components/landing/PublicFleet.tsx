/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Car, Fuel, Map, User, MapPin, ChevronRight, Star, ChevronLeft, Circle, CircleDot, Gauge } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

function VehicleCard({ vehicle, handleBookClick, itemVariants }: { vehicle: any, handleBookClick: (v: any) => void, itemVariants: any }) {
    const imagesFromVehicle = Array.isArray(vehicle.images) ? vehicle.images : (typeof vehicle.images === 'string' ? JSON.parse(vehicle.images || "[]") : []);
    const images = imagesFromVehicle.length > 0 ? imagesFromVehicle : (vehicle.image ? [vehicle.image] : []);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [images.length]);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToImage = (e: React.MouseEvent, idx: number) => {
        e.stopPropagation();
        setCurrentIndex(idx);
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col relative"
        >
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-white/20 shadow-lg flex items-center gap-2">
                <Gauge size={12} />
                {vehicle.range}
            </div>
            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-bold text-orange-600 uppercase tracking-wider border border-white/20 shadow-lg flex items-center gap-2">
                <Fuel size={12} />
                {vehicle.type}
            </div>
            <div className="relative h-56 bg-slate-100 overflow-hidden group/carousel">
                {images.length > 0 ? (
                    <img src={images[currentIndex]} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Car size={80} strokeWidth={1} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                    <span className="text-white text-xs font-medium flex items-center gap-2">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" /> Vehículo Premium
                    </span>
                </div>

                {/* Carousel Controls */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                            {images.map((_: any, idx: number) => (
                                <button key={idx} onClick={(e) => goToImage(e, idx)} className="text-white drop-shadow-md">
                                    {idx === currentIndex ? <CircleDot size={12} /> : <Circle size={12} className="fill-white/50" />}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{vehicle.name}</h3>
                        <div className="flex items-center gap-3">
                            <p className="text-xs text-slate-500 font-medium">{vehicle.year}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium border-l border-slate-200 pl-3">
                                <User size={12} className="text-blue-500" />
                                <span>{vehicle.seats || 5} Plazas</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">Desde</div>
                        <div className="text-xl font-bold text-slate-900 leading-none">{formatCurrency(vehicle.price)}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1">/ día</div>
                    </div>
                </div>

                <div className="mt-auto">
                    <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white h-11 rounded-xl text-sm font-semibold shadow-md shadow-slate-100 transition-all duration-300" onClick={() => handleBookClick(vehicle)}>
                        Reservar Ahora
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

export function PublicFleet({ vehicles }: { vehicles: any[] }) {
    const router = useRouter();
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        startDate: '',
        endDate: '',
        withDriver: false,
        fuel: false,
        tolls: false
    });
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [contactData, setContactData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isContactSubmitting, setIsContactSubmitting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBookClick = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleServiceChange = (service: string) => {
        setFormData(prev => ({ ...prev, [service]: !prev[service as keyof typeof prev] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                vehicleId: selectedVehicle.id,
                vehicleName: selectedVehicle.name,
                ...formData,
                services: {
                    withDriver: formData.withDriver,
                    fuel: formData.fuel,
                    tolls: formData.tolls
                }
            };

            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Error al enviar solicitud');

            toast.success("Solicitud enviada con éxito. Nos pondremos en contacto pronto.");
            setIsModalOpen(false);
            setFormData({
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                clientAddress: '',
                startDate: '',
                endDate: '',
                withDriver: false,
                fuel: false,
                tolls: false
            });
        } catch (error) {
            console.error(error);
            toast.error("Hubo un error al enviar tu solicitud. Inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsContactSubmitting(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            if (!res.ok) throw new Error("Error enviando mensaje");

            toast.success("Mensaje enviado correctamente. Te contactaremos pronto.");
            setIsContactModalOpen(false);
            setContactData({ name: '', email: '', phone: '', message: '' });
        } catch {
            toast.error("Error al enviar el mensaje.");
        } finally {
            setIsContactSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between mx-auto px-4">
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-900 tracking-tight">
                        <motion.div
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            className="relative h-16 w-16"
                        >
                            <img src="/logo.png" alt="Urban Rentals Logo" className="object-contain w-full h-full drop-shadow-md" />
                        </motion.div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Urban Rentals</span>
                    </div>
                    <Button
                        onClick={() => router.push('/login')}
                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 shadow-md transition-all hover:shadow-lg font-medium"
                    >
                        Entrar <ChevronRight size={16} className="ml-1" />
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[600px] flex items-center justify-center bg-slate-900 overflow-hidden py-20 lg:py-0">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 z-10" />
                    {/* Decorative blurred circles behind the content */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
                </div>
                <div className="container relative z-20 px-4 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="order-2 lg:order-1 text-center lg:text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 font-medium text-sm mb-6 border border-blue-500/20">
                                <Star size={14} className="fill-blue-400" /> Premium Rentals en Guinea Ecuatorial
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-tight drop-shadow-sm">
                                Tu viaje, <br className="hidden lg:block" /> a otro <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">nivel.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                                Ofrecemos la flota más moderna y exclusiva. Tarifas competitivas, confort superior y atención personalizada las 24 horas para hacer de tu viaje una experiencia inolvidable.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-blue-900/50 shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                    onClick={() => {
                                        document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <Car size={20} />
                                    Ver Flota Disponible
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-full px-8 h-14 text-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
                                    onClick={() => setIsContactModalOpen(true)}
                                >
                                    Asesoría Personalizada
                                </Button>
                            </div>
                        </motion.div>

                        {/* Image Content */}
                        <motion.div
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="order-1 lg:order-2 flex justify-center lg:justify-end relative"
                        >
                            <motion.div
                                animate={{ y: [-15, 15, -15] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="relative z-10 w-full max-w-lg lg:max-w-xl"
                            >
                                <div className="relative w-full h-full min-h-[400px] flex items-center justify-center lg:justify-end">

                                    {/* Moving Speed Lines Container (Behind Car) */}
                                    <div className="absolute inset-y-0 right-0 w-[150%] max-w-[1200px] pointer-events-none z-0 overflow-hidden flex flex-col justify-center gap-12">
                                        <motion.div className="w-[800px] h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-[2px] opacity-70"
                                            animate={{ x: [800, -1000], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} />
                                        <motion.div className="w-[1000px] h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[3px] opacity-50"
                                            animate={{ x: [1000, -1200], opacity: [0, 0.8, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.8, ease: "linear" }} />
                                        <motion.div className="w-[600px] h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-[1px] opacity-80"
                                            animate={{ x: [600, -800], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1.5, ease: "linear" }} />
                                        <motion.div className="w-[900px] h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[2px] opacity-60"
                                            animate={{ x: [900, -1100], opacity: [0, 0.9, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.3, ease: "linear" }} />
                                    </div>

                                    {/* Main Body (Static Car Image -> z-10) */}
                                    <div className="relative z-10 w-full max-w-[650px] aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                                        <img
                                            src="/hero-car.jpg"
                                            alt="Urban Rentals Premium Fleet"
                                            className="w-full h-full object-cover object-center"
                                        />
                                        {/* Subtle overlay to blend perfectly with dark blue background */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80 pointer-events-none" />
                                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0F172A] opacity-30 pointer-events-none" />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Fleet Grid */}
            <section id="fleet" className="py-24 container mx-auto px-4 bg-slate-50">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Nuestra Flota</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        Selecciona el vehículo perfecto para tu próxima aventura.
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {vehicles.map(vehicle => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} handleBookClick={handleBookClick} itemVariants={itemVariants} />
                    ))}
                </motion.div>

                {vehicles.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-6">
                            <Car size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No hay vehículos disponibles</h3>
                        <p className="text-slate-500 max-w-md mx-auto">Actualmente toda nuestra flota se encuentra reservada. Por favor, vuelve a intentarlo más tarde.</p>
                    </div>
                )}
            </section>

            {/* Services Section */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Experiencia Urban Rentals</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Más que un alquiler de coches, ofrecemos una solución integral de movilidad.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: User, title: "Chofer Ejecutivo", desc: "Conductores profesionales entrenados para brindar el mejor servicio." },
                            { icon: Fuel, title: "Todo Incluido", desc: "Olvídate del combustible. Entregamos el tanque lleno y listo para rodar." },
                            { icon: MapPin, title: "Cobertura Total", desc: "Viaja sin límites con nuestra asistencia en carretera a nivel nacional." }
                        ].map((service, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-8 rounded-3xl hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20">
                                    <service.icon size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{service.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{service.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-500 py-16 border-t border-slate-900">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 font-bold text-2xl text-white mb-6">
                                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center p-2">
                                    <img src="/logo.png" alt="Urban Rentals" className="w-full h-full object-contain" />
                                </div>
                                Urban Rentals
                            </div>
                            <p className="max-w-xs text-slate-400">
                                La plataforma líder en gestión y alquiler de flotas corporativas y personales.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Enlaces</h4>
                            <ul className="space-y-4">
                                <li>
                                    <button
                                        onClick={() => document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="hover:text-blue-500 transition-colors text-left"
                                    >
                                        Flota
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setIsContactModalOpen(true)}
                                        className="hover:text-blue-500 transition-colors text-left"
                                    >
                                        Contacto
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Legal</h4>
                            <ul className="space-y-4">
                                <li><a href="/terms" className="hover:text-blue-500 transition-colors">Términos</a></li>
                                <li><a href="/privacy" className="hover:text-blue-500 transition-colors">Privacidad</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-900 text-center text-sm">
                        <p>&copy; {new Date().getFullYear()} Urban Rentals. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Booking Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Solicitar Reserva</DialogTitle>
                        <DialogDescription>
                            Completa tus datos para solicitar el <strong>{selectedVehicle?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start">Fecha Inicio</Label>
                                <Input id="start" type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">Fecha Fin (Opcional)</Label>
                                <Input id="end" type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                            </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-3 border p-4 rounded-lg bg-slate-50">
                            <Label className="text-base font-semibold">Servicios Adicionales</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="driver" checked={formData.withDriver} onCheckedChange={() => handleServiceChange('withDriver')} />
                                <Label htmlFor="driver" className="cursor-pointer">Conductor Profesional</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="fuel" checked={formData.fuel} onCheckedChange={() => handleServiceChange('fuel')} />
                                <Label htmlFor="fuel" className="cursor-pointer">Prepago Combustible</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="tolls" checked={formData.tolls} onCheckedChange={() => handleServiceChange('tolls')} />
                                <Label htmlFor="tolls" className="cursor-pointer">Pass Peajes</Label>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input id="name" placeholder="Ej. Juan Pérez" required value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input id="phone" placeholder="+240..." required value={formData.clientPhone} onChange={e => setFormData({ ...formData, clientPhone: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="juan@ejemplo.com" required value={formData.clientEmail} onChange={e => setFormData({ ...formData, clientEmail: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input id="address" placeholder="Tu dirección principal" value={formData.clientAddress} onChange={e => setFormData({ ...formData, clientAddress: e.target.value })} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting ? 'Enviando...' : 'Confirmar Solicitud'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Contact Modal */}
            <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Contáctanos</DialogTitle>
                        <DialogDescription>
                            ¿Tienes alguna duda o requerimiento especial? Escríbenos.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="c-name">Nombre</Label>
                            <Input id="c-name" required value={contactData.name} onChange={e => setContactData({ ...contactData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="c-email">Email</Label>
                            <Input id="c-email" type="email" required value={contactData.email} onChange={e => setContactData({ ...contactData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="c-phone">Teléfono</Label>
                            <Input id="c-phone" required value={contactData.phone} onChange={e => setContactData({ ...contactData, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="c-message">Mensaje</Label>
                            <Input id="c-message" required value={contactData.message} onChange={e => setContactData({ ...contactData, message: e.target.value })} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsContactModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isContactSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isContactSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
