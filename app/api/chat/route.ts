import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const OPENROUTER_API_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Obtener vehículos actuales de la BD
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { name: "asc" },
    });

    const disponibles = vehicles.filter((v) => v.status === "Disponible");
    const rentados = vehicles.filter((v) => v.status === "Rentado");
    const mantenimiento = vehicles.filter((v) => v.status === "Mantenimiento");

    const vehicleList = vehicles
      .map((v) => {
        const statusLabel =
          v.status === "Disponible"
            ? "✅ DISPONIBLE"
            : v.status === "Rentado"
            ? "🔴 RENTADO (no disponible ahora)"
            : "🔧 EN MANTENIMIENTO";

        return `- ${v.name} | ${statusLabel} | Tipo: ${v.type} | Año: ${v.year} | Plazas: ${v.seats} | Autonomía: ${v.range} km | Precio: ${v.price.toLocaleString("es-GQ")} XAF/día | Placa: ${v.plate} | Propiedad: ${v.ownership}`;
      })
      .join("\n");

    const systemPrompt = `Eres el asistente virtual de Urban Rentals, una empresa de alquiler de vehículos en Guinea Ecuatorial (Malabo). Tu misión es ayudar a los usuarios con información sobre los vehículos y el servicio de alquiler.

INFORMACIÓN DE LA EMPRESA:
- Nombre: Urban Rentals
- Ubicación: Malabo 2, Bioko Norte, Guinea Ecuatorial
- Teléfono/WhatsApp: +240 222 090 172
- Email: contacto@urbanrentals.com
- Web: urban-rentals.es
- Horario: Lunes-Viernes 8:00-18:00 | Sábados 9:00-14:00

FLOTA ACTUAL EN TIEMPO REAL (${vehicles.length} vehículos en total):
${vehicleList}

RESUMEN:
- Disponibles ahora: ${disponibles.length} vehículos
- Rentados actualmente: ${rentados.length} vehículos
- En mantenimiento: ${mantenimiento.length} vehículos

VEHÍCULOS DISPONIBLES PARA ALQUILAR HOY:
${disponibles.length > 0 ? disponibles.map((v) => `• ${v.name} (${v.year}) — ${v.seats} plazas — ${v.price.toLocaleString("es-GQ")} XAF/día`).join("\n") : "No hay vehículos disponibles en este momento."}

VEHÍCULOS NO DISPONIBLES AHORA:
${rentados.length > 0 ? rentados.map((v) => `• ${v.name} — actualmente rentado`).join("\n") : "Ninguno rentado actualmente."}
${mantenimiento.length > 0 ? mantenimiento.map((v) => `• ${v.name} — en mantenimiento`).join("\n") : ""}

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé amable, profesional y conciso
- Si preguntan por vehículos disponibles, lista SOLO los que tienen estado DISPONIBLE
- Si preguntan por un vehículo rentado, indica que no está disponible actualmente pero que pueden consultarnos cuando quede libre (no sabes exactamente cuándo)
- Para reservar, indica que llamen al +240 222 090 172 o escriban por WhatsApp
- No inventes información que no tengas
- Si no sabes algo, redirige a contacto directo
- Las respuestas deben ser cortas y claras (máximo 5-6 líneas)`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://urban-rentals.es",
        "X-Title": "Urban Rentals Chatbot",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", err);
      return NextResponse.json({ error: "Error al contactar la IA" }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Lo siento, no pude procesar tu mensaje. Por favor contáctanos directamente.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
