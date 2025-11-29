import { Sidebar } from "@/components/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CustomersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
