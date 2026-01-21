import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SGFlota - Sistema de Gestión de Flota",
  description: "Sistema Premium de Gestión de Flota de Vehículos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DataProvider>
          {children}
          <Toaster position="top-right" richColors />
        </DataProvider>
      </body>
    </html>
  );
}
