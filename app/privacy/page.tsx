
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrivacyPage() {
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
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900">Política de Privacidad</h1>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="lead">Tu privacidad es importante para nosotros.</p>

                        <h3>1. Información que Recopilamos</h3>
                        <p>Recopilamos información personal que nos proporcionas directamente, como tu nombre, dirección de correo electrónico, número de teléfono y dirección, cuando realizas una reserva o te pones en contacto con nosotros.</p>

                        <h3>2. Uso de la Información</h3>
                        <p>Utilizamos tu información para procesar tus reservas, comunicarnos contigo sobre nuestros servicios y mejorar tu experiencia en nuestra plataforma. No compartimos tu información con terceros sin tu consentimiento, excepto cuando sea necesario para prestar el servicio o cumplir con la ley.</p>

                        <h3>3. Seguridad de los Datos</h3>
                        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra el acceso no autorizado, la pérdida o la alteración.</p>

                        <h3>4. Tus Derechos</h3>
                        <p>Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Si deseas ejercer estos derechos, por favor contáctanos.</p>

                        <h3>5. Cookies</h3>
                        <p>Utilizamos cookies para mejorar la funcionalidad de nuestro sitio web y analizar el tráfico. Puedes configurar tu navegador para rechazar las cookies si lo prefieres.</p>

                        <h3>6. Cambios en la Política</h3>
                        <p>Podemos actualizar esta política de privacidad ocasionalmente. Te recomendamos revisarla periódicamente para estar informado sobre cómo protegemos tu información.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
