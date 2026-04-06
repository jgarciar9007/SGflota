import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { Toaster } from "sonner";
import Providers from "./Providers";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ChatBot } from "@/components/ui/ChatBot";

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
    default: "Urban Rentals | Alquiler de Vehículos y Casas en Guinea Ecuatorial",
    template: "%s | Urban Rentals Guinea Ecuatorial"
  },
  description: "Alquiler de vehículos y casas en Guinea Ecuatorial. Coches, SUV y 4x4 en Malabo y Bata. Propiedades residenciales y corporativas. ¡Reserva hoy con Urban Rentals!",
  keywords: "alquiler de coches Guinea Ecuatorial, alquiler de vehículos Malabo, rent a car Guinea Ecuatorial, renta de autos Malabo, alquiler de autos Bata, coches de alquiler Guinea Ecuatorial, SUV 4x4 Guinea Ecuatorial, alquiler con conductor Malabo, alquiler de casas Guinea Ecuatorial, casas en alquiler Malabo, alquiler de pisos Malabo, alquiler de apartamentos Bata, alquiler de villas Guinea Ecuatorial, alquiler de propiedades Guinea Ecuatorial, agencia inmobiliaria Malabo, alquiler mensual Guinea Ecuatorial, alquiler temporal Malabo, Urban Rentals, rent a car Malabo, car rental Equatorial Guinea, house rental Equatorial Guinea, vehicle rental Malabo, location voiture Guinée Équatoriale, location maison Guinée Équatoriale, alquiler inmuebles Guinea Ecuatorial",
  authors: [{ name: "Urban Rentals" }],
  creator: "Urban Rentals",
  publisher: "Urban Rentals",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Urban Rentals | Alquiler de Vehículos y Casas en Guinea Ecuatorial",
    description: "Alquiler de vehículos y casas en Guinea Ecuatorial. Coches, SUV y 4x4 en Malabo y Bata. Propiedades residenciales y corporativas. ¡Reserva hoy!",
    url: "https://urban-rentals.es",
    siteName: "Urban Rentals",
    images: [
      {
        url: "/hero-car.jpg",
        width: 1200,
        height: 630,
        alt: "Urban Rentals — Alquiler de Vehículos y Casas en Guinea Ecuatorial"
      },
    ],
    locale: "es_GQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Rentals | Alquiler de Vehículos y Casas en Guinea Ecuatorial",
    description: "Alquiler de coches, SUV, 4x4 y casas en Malabo y Bata. ¡Reserva hoy con Urban Rentals!",
    images: ["/hero-car.jpg"],
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

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": ["AutoRental", "LocalBusiness"],
    "name": "Urban Rentals — Alquiler de Vehículos",
    "image": "https://urban-rentals.es/logo.png",
    "url": "https://urban-rentals.es",
    "telephone": "+240 222 222 222",
    "description": "Servicio profesional de alquiler de vehículos en Guinea Ecuatorial. Coches, SUV y 4x4 en Malabo y Bata.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Malabo",
      "addressCountry": "GQ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 3.750412,
      "longitude": 8.784400
    },
    "areaServed": [
      { "@type": "City", "name": "Malabo" },
      { "@type": "City", "name": "Bata" },
      { "@type": "Country", "name": "Guinea Ecuatorial" }
    ],
    "priceRange": "$$",
    "sameAs": ["https://urban-rentals.es"]
  },
  {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "name": "Urban Rentals — Alquiler de Casas",
    "image": "https://urban-rentals.es/logo.png",
    "url": "https://casas.urban-rentals.es",
    "description": "Alquiler de casas, pisos y apartamentos en Guinea Ecuatorial. Propiedades residenciales y corporativas en Malabo y Bata.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Malabo",
      "addressCountry": "GQ"
    },
    "areaServed": [
      { "@type": "City", "name": "Malabo" },
      { "@type": "City", "name": "Bata" },
      { "@type": "Country", "name": "Guinea Ecuatorial" }
    ],
    "priceRange": "$$"
  }
];

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
            <WhatsAppButton />
            <ChatBot />
          </DataProvider>
        </Providers>
      </body>
    </html>
  );
}
