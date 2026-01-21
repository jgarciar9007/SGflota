"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Car, LayoutDashboard, Settings, Calendar, LogOut, CreditCard, Wrench, FileText } from "lucide-react";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Car, label: "Flota", href: "/fleet" },
    { icon: Calendar, label: "Rentas", href: "/rentals" },
    { icon: CreditCard, label: "Facturación", href: "/billing" },
    { icon: Wrench, label: "Gastos y Mantenimiento", href: "/expenses" },
    { icon: FileText, label: "Reportes", href: "/reports" },
    { icon: Settings, label: "Configuración", href: "/settings" },
];

import { useData } from "@/context/DataContext";

// ... existing code ...

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, canAccessSettings } = useData();

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        router.push("/login");
    };

    return (
        <div className="flex h-full w-64 flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center border-b border-border px-6">
                <Car className="mr-2 h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">SGFlota</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        // Hide Settings if user cannot access
                        if (item.label === "Configuración" && !canAccessSettings(currentUser)) {
                            return null;
                        }

                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            {/* Footer */}
            <div className="border-t border-border p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
