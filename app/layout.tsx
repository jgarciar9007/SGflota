import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { Toaster } from "sonner";
import Providers from "./Providers";

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
  title: "Urban Rentals",
  description: "Plataforma Premium de Gestión de Flota y Alquiler de Autos en Guinea Ecuatorial. Ofrecemos vehículos modernos, seguros y confortables.",
  keywords: "alquiler de autos, guinea ecuatorial, renta de vehiculos, malabo, bata, urban rentals",
  openGraph: {
    title: "Urban Rentals",
    description: "La mejor opción para alquiler de autos en Guinea Ecuatorial.",
    url: "https://urban-rentals.es",
    siteName: "Urban Rentals",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "es_GQ",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
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
        <Providers>
          <DataProvider>
            {children}
            <Toaster position="top-right" richColors />
          </DataProvider>
        </Providers>
      </body>
    </html>
  );
}
