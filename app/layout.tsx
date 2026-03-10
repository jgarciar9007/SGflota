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
  metadataBase: new URL("https://urban-rentals.es"),
  title: {
    default: "Urban Rentals | Alquiler de Vehículos en Guinea Ecuatorial",
    template: "%s | Urban Rentals"
  },
  description: "La mejor agencia de alquiler de autos en Guinea Ecuatorial. Ofrecemos vehículos modernos, seguros y confortables para renta en Malabo, Bata y a nivel nacional. Reserva tu coche hoy.",
  keywords: "alquiler de autos, guinea ecuatorial, renta de vehiculos, alquiler de coches malabo, renta de autos bata, urban rentals, rent a car guinea ecuatorial, coches familiares, SUV 4x4",
  authors: [{ name: "Urban Rentals" }],
  creator: "Urban Rentals",
  publisher: "Urban Rentals",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Urban Rentals | Alquiler de Vehículos en Guinea Ecuatorial",
    description: "Encuentra el vehículo perfecto para tu viaje o negocio. Renta de autos seguros y modernos en Guinea Ecuatorial.",
    url: "https://urban-rentals.es",
    siteName: "Urban Rentals",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Urban Rentals Logo"
      },
    ],
    locale: "es_GQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Rentals | Alquiler de Vehículos",
    description: "Renta de autos modernos y seguros en Guinea Ecuatorial.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": ["AutoRental", "LocalBusiness"],
  "name": "Urban Rentals",
  "image": "https://urban-rentals.es/logo.png",
  "url": "https://urban-rentals.es",
  "telephone": "+240 222 222 222", // Placeholder, you should update this in the layout or via settings
  "description": "Servicio profesional de alquiler de vehículos en Guinea Ecuatorial.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Malabo", // Adjust if main office is in Bata
    "addressCountry": "GQ"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 3.750412, // Malabo approx coordinates
    "longitude": 8.784400
  },
  "areaServed": {
    "@type": "Country",
    "name": "Equatorial Guinea"
  },
  "priceRange": "$$"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
