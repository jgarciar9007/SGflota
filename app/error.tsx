'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Algo salió mal!</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                Ha ocurrido un error inesperado al procesar tu solicitud. Nuestro equipo ha sido notificado.
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Intentar de nuevo
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                    Recargar página
                </Button>
            </div>
        </div>
    );
}
