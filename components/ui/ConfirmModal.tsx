
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";


interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "success" | "info";
    isLoading?: boolean;
}

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "info",
    isLoading = false
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    // Use portal if possible, or just render (assuming this is used within a valid root). 
    // Since we are in nextjs/react app, simple rendering often works if placed high up, 
    // but fixed overlay handles positioning.

    const getIcon = () => {
        switch (variant) {
            case "danger": return <AlertTriangle className="h-6 w-6 text-red-600" />;
            case "success": return <CheckCircle className="h-6 w-6 text-green-600" />;
            default: return <Info className="h-6 w-6 text-blue-600" />;
        }
    };

    const getButtonColor = () => {
        switch (variant) {
            case "danger": return "bg-red-600 hover:bg-red-700 focus:ring-red-600";
            case "success": return "bg-green-600 hover:bg-green-700 focus:ring-green-600";
            default: return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md border-border bg-card shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-opacity-10 ${variant === 'danger' ? 'bg-red-100' : variant === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
                            {getIcon()}
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full -mr-2"
                        disabled={isLoading}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-muted-foreground text-base leading-relaxed mb-8">
                        {description}
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="border-border text-foreground hover:bg-accent"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`${getButtonColor()} text-white shadow-md transition-all active:scale-95`}
                        >
                            {isLoading ? "Procesando..." : confirmText}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConfirmModal;
