"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Car, LayoutDashboard, Settings, Users, Calendar, LogOut, CreditCard, Wrench, FileText } from "lucide-react";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Car, label: "Flota", href: "/fleet" },
    { icon: Calendar, label: "Rentas", href: "/rentals" },
    { icon: Users, label: "Clientes", href: "/customers" },
    { icon: CreditCard, label: "Facturación", href: "/billing" },
    { icon: Wrench, label: "Mantenimiento", href: "/maintenance" },
    { icon: FileText, label: "Reportes", href: "/reports" },
    { icon: Settings, label: "Configuración", href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        router.push("/login");
    };

    return (
        <div className="flex h-full w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b border-white/10 px-6">
                <Car className="mr-2 h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-white">SGFlota</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-white",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-400 hover:bg-white/5"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-white/10 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-500"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
