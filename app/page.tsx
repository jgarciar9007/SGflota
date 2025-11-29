"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated === "true") {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
