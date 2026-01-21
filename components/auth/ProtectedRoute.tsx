"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { currentUser, isLoading } = useData();

    useEffect(() => {
        if (!isLoading && !currentUser) {
            router.push("/login");
        }
    }, [isLoading, currentUser, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    return <>{children}</>;
}
