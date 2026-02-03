
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft size={16} /> Volver al Inicio
                        </Button>
                    </Link>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900">Términos y Condiciones</h1>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="lead">Última actualización: {new Date().getFullYear()}</p>

                        <h3>1. Introducción</h3>
                        <p>Bienvenido a SGFlota. Al acceder y utilizar nuestro sitio web y servicios, aceptas cumplir con los siguientes términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, por favor no utilices nuestros servicios.</p>

                        <h3>2. Uso del Servicio</h3>
                        <p>Nuestros servicios están destinados exclusivamente para el alquiler de vehículos y gestión de flotas. Te comprometes a utilizar la plataforma de manera legal y ética.</p>

                        <h3>3. Reservas y Pagos</h3>
                        <p>Todas las reservas están sujetas a disponibilidad y confirmación. Los precios mostrados son en FCFA y pueden cambiar sin previo aviso. El pago debe realizarse según las condiciones acordadas en el contrato de alquiler.</p>

                        <h3>4. Responsabilidades del Usuario</h3>
                        <p>Como usuario, eres responsable de proporcionar información veraz y mantener la confidencialidad de tus datos de acceso. También eres responsable del vehículo durante el periodo de alquiler.</p>

                        <h3>5. Modificaciones</h3>
                        <p>SGFlota se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>

                        <h3>6. Contacto</h3>
                        <p>Si tienes alguna pregunta sobre estos términos, por favor contáctanos a través de nuestro formulario en la página principal.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
