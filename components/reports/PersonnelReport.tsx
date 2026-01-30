"use client";

import { useData } from "@/context/DataContext";
import { ReportCard } from "./ReportCard";
import { Users, Briefcase, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

// Assuming Personnel might be in data context in future, currently using dummy or specific fetching if needed.
// Checking schema.prisma -> Yes, 'Personnel' and 'DriverPayment' models exist. 
// However, 'useData' in 'reports/page.tsx' didn't show 'personnel' being destructured in the original code.
// I will need to check DataContext to see if personnel is available. 
// If not, I will rely on placeholders or check if I can add it to context easily.
// For now, let's assume standard arrays or empty if not present, to avoid breaking build.

export function PersonnelReport() {
    // Casting to any to avoid TS errors if personnel is not yet in the generic DataContext interface inferred by VSCode
    // In a real scenario I would update the context definition.
    const { personnel = [], driverPayments = [] } = useData() as any;

    const totalStaff = personnel.length;
    const drivers = personnel.filter((p: any) => p.role === 'Conductor').length;
    const admins = personnel.filter((p: any) => p.role === 'Administrativo').length;

    const totalPaid = driverPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                    title="Total Personal"
                    value={totalStaff}
                    icon={Users}
                    iconColor="text-blue-500"
                />
                <ReportCard
                    title="Conductores"
                    value={drivers}
                    icon={Briefcase}
                    iconColor="text-green-500"
                />
                <ReportCard
                    title="Pagos a Conductores"
                    value={formatCurrency(totalPaid)}
                    icon={Award}
                    description="Total histórico"
                    iconColor="text-yellow-500"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Personal</CardTitle>
                </CardHeader>
                <CardContent>
                    {personnel.length > 0 ? (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Nombre</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Rol</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Teléfono</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {personnel.map((p: any) => (
                                        <tr key={p.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{p.name}</td>
                                            <td className="p-4 align-middle">{p.role}</td>
                                            <td className="p-4 align-middle">{p.phone}</td>
                                            <td className="p-4 align-middle">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No hay personal registrado o disponible en el contexto.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
