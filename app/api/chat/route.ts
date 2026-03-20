import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── Configuración IA ─────────────────────────────────────────────────────────
// Cuando tengas una clave válida de OpenRouter, ponla aquí:
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Vehicle {
  id: string; name: string; type: string; range: string; price: number;
  image: string; status: string; plate: string; year: number;
  ownership: string; seats: number; ownerName?: string | null; ownerDni?: string | null;
}

// ─── Fallback inteligente (sin IA externa) ────────────────────────────────────
function buildSmartReply(userMsg: string, vehicles: Vehicle[]): string {
  const q = userMsg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const disponibles = vehicles.filter((v) => v.status === "Disponible");
  const rentados    = vehicles.filter((v) => v.status === "Rentado");
  const mant        = vehicles.filter((v) => v.status === "Mantenimiento");

  const fmt = (p: number) => p.toLocaleString("es-ES") + " XAF";

  // Saludo
  if (/^(hola|buenas|buenos|hi|hello|hey|saludos|buen dia|buen dia)/.test(q)) {
    return `¡Hola! 👋 Bienvenido a Urban Rentals.\n\nTenemos ${disponibles.length} vehículos disponibles ahora mismo. ¿En qué puedo ayudarte?`;
  }

  // Búsqueda por número de plazas (más de X / menos de X / exactamente X)
  const seatsMoreMatch = q.match(/(?:mas\s+de|superior\s+a|mayor\s+a)\s*(\d+)\s*plazas?/);
  const seatsLessMatch = q.match(/(?:menos\s+de|inferior\s+a)\s*(\d+)\s*plazas?/);
  const seatsExactMatch = q.match(/(\d+)\s*plazas?/);
  if (seatsMoreMatch) {
    const n = parseInt(seatsMoreMatch[1]);
    const filtered = disponibles.filter((v) => v.seats > n);
    if (filtered.length === 0) return `No tenemos vehículos disponibles con más de ${n} plazas. Contáctanos al +240 222 090 172.`;
    return `Vehículos disponibles con más de ${n} plazas:\n\n${filtered.map((v) => `• ${v.name} (${v.year}) — ${v.seats} plazas — ${fmt(v.price)}/día`).join("\n")}\n\n¿Te interesa alguno?`;
  }
  if (seatsLessMatch) {
    const n = parseInt(seatsLessMatch[1]);
    const filtered = disponibles.filter((v) => v.seats < n);
    if (filtered.length === 0) return `No tenemos vehículos disponibles con menos de ${n} plazas. Contáctanos al +240 222 090 172.`;
    return `Vehículos disponibles con menos de ${n} plazas:\n\n${filtered.map((v) => `• ${v.name} (${v.year}) — ${v.seats} plazas — ${fmt(v.price)}/día`).join("\n")}\n\n¿Te interesa alguno?`;
  }
  if (seatsExactMatch) {
    const numSeats = parseInt(seatsExactMatch[1]);
    const withSeats = disponibles.filter((v) => v.seats === numSeats);
    if (withSeats.length === 0) return `No tenemos vehículos disponibles de ${numSeats} plazas en este momento. Contáctanos al +240 222 090 172 para más opciones.`;
    return `Vehículos disponibles de ${numSeats} plazas:\n\n${withSeats.map((v) => `• ${v.name} (${v.year}) — ${fmt(v.price)}/día`).join("\n")}\n\n¿Te interesa alguno?`;
  }

  // Filtro por precio máximo (menos de X / hasta X / por menos de X)
  const priceMaxMatch = q.match(/(?:menos\s+de|hasta|por\s+menos\s+de)\s*([\d\s.,]+)/);
  if (priceMaxMatch) {
    const priceLimit = parseInt(priceMaxMatch[1].replace(/[\s.,]/g, ""));
    if (!isNaN(priceLimit)) {
      const filtered = disponibles.filter((v) => v.price < priceLimit);
      if (filtered.length === 0) return `No tenemos vehículos disponibles por menos de ${fmt(priceLimit)}. El más económico es ${fmt(Math.min(...disponibles.map(v => v.price)))}/día. ¿Te interesa?`;
      return `Vehículos disponibles por menos de ${fmt(priceLimit)}/día:\n\n${filtered.map((v) => `• ${v.name} (${v.year}) — ${v.seats} plazas — ${fmt(v.price)}/día`).join("\n")}\n\n¿Te interesa alguno?`;
    }
  }

  // Filtro por precio mínimo (más de X / desde X)
  const priceMinMatch = q.match(/(?:mas\s+de|desde)\s*([\d\s.,]+)/);
  if (priceMinMatch) {
    const priceLimit = parseInt(priceMinMatch[1].replace(/[\s.,]/g, ""));
    if (!isNaN(priceLimit)) {
      const filtered = disponibles.filter((v) => v.price > priceLimit);
      if (filtered.length === 0) return `No tenemos vehículos disponibles por más de ${fmt(priceLimit)}. Contáctanos al +240 222 090 172.`;
      return `Vehículos disponibles por más de ${fmt(priceLimit)}/día:\n\n${filtered.map((v) => `• ${v.name} (${v.year}) — ${v.seats} plazas — ${fmt(v.price)}/día`).join("\n")}\n\n¿Te interesa alguno?`;
    }
  }

  // Disponibilidad general
  if (/disponible|disponibilidad|libre|alquilar|rentar|que.*tienen|que.*hay|flota/.test(q)) {
    if (disponibles.length === 0) return "En este momento no tenemos vehículos disponibles. Contáctanos al +240 222 090 172 para más información.";
    const lista = disponibles.map((v) => `• ${v.name} (${v.year}) — ${v.seats} plazas — ${fmt(v.price)}/día`).join("\n");
    return `Tenemos ${disponibles.length} vehículos disponibles ahora:\n\n${lista}\n\n¿Te interesa alguno en particular?`;
  }

  // Precios / tarifas
  if (/precio|tarifa|costo|cuanto|cuanto cuesta|rate|valor/.test(q)) {
    if (disponibles.length === 0) return "Actualmente no tenemos vehículos disponibles. Llámanos al +240 222 090 172.";
    const lista = disponibles.map((v) => `• ${v.name} — ${fmt(v.price)}/día`).join("\n");
    return `💰 Tarifas diarias de vehículos disponibles:\n\n${lista}\n\nLos precios incluyen seguro básico. ¿Necesitas más detalles?`;
  }

  // Buscar vehículo específico por nombre
  const vehicleMatch = vehicles.find((v) =>
    q.includes(v.name.toLowerCase().split(" ")[0]) ||
    q.includes(v.name.toLowerCase().split(" ")[1] ?? "___")
  );
  if (vehicleMatch) {
    const estado = vehicleMatch.status === "Disponible"
      ? "✅ disponible para alquilar"
      : vehicleMatch.status === "Rentado"
      ? "🔴 actualmente rentado (no disponible)"
      : "🔧 en mantenimiento";

    return `**${vehicleMatch.name}** (${vehicleMatch.year})\n\n• Estado: ${estado}\n• Tipo: ${vehicleMatch.type}\n• Plazas: ${vehicleMatch.seats}\n• Autonomía: ${vehicleMatch.range} km\n• Precio: ${fmt(vehicleMatch.price)}/día\n\n${vehicleMatch.status === "Disponible" ? "¡Está disponible! ¿Quieres reservarlo?" : "Por el momento no está disponible. Puedes consultarnos cuando quedará libre llamando al +240 222 090 172."}`;
  }

  // SUV / 4x4
  if (/suv|4x4|terreno|campo|todo terreno/.test(q)) {
    const suvs = disponibles.filter((v) => /SUV|4x4|Prado|Hilux|Highlander|Fortuner/i.test(v.name));
    if (suvs.length === 0) return "No tenemos SUVs o 4x4 disponibles en este momento. Contáctanos al +240 222 090 172 para más info.";
    return `🚙 SUVs y 4x4 disponibles:\n\n${suvs.map((v) => `• ${v.name} (${v.year}) — ${v.seats} plazas — ${fmt(v.price)}/día`).join("\n")}\n\n¿Te interesa alguno?`;
  }

  // Minibús / grupo / pasajeros
  if (/minibus|minivan|grupo|pasajero|personas|capacidad|asiento|plaza/.test(q)) {
    const grandes = disponibles.filter((v) => v.seats >= 7).sort((a, b) => b.seats - a.seats);
    if (grandes.length === 0) return "No tenemos vehículos de gran capacidad disponibles ahora. Llámanos al +240 222 090 172.";
    return `👥 Vehículos con mayor capacidad disponibles:\n\n${grandes.map((v) => `• ${v.name} — ${v.seats} plazas — ${fmt(v.price)}/día`).join("\n")}\n\n¿Cuántas personas necesitas transportar?`;
  }

  // Conductor
  if (/conductor|chofer|con.*chofer|con.*conductor|driver/.test(q)) {
    return `🧑‍✈️ Sí, ofrecemos servicio **con conductor profesional** con costo adicional.\n\nPara cotizar este servicio, contáctanos directamente:\n📞 WhatsApp: +240 222 090 172\n📧 contacto@urbanrentals.com`;
  }

  // Reserva
  if (/reserva|reservar|booking|como.*alquil|quiero.*alquil|contrat/.test(q)) {
    return `📋 Para hacer tu reserva:\n\n1️⃣ Llámanos o escríbenos por WhatsApp al **+240 222 090 172**\n2️⃣ Dinos las fechas y el vehículo que necesitas\n3️⃣ Presentas tu cédula o pasaporte y licencia de conducir\n\n¿Qué vehículo te interesa?`;
  }

  // Documentos
  if (/documento|requisito|licencia|carnet|pasaporte|dni|cedula/.test(q)) {
    return `📄 Documentos necesarios:\n\n✅ Cédula de identidad o pasaporte vigente\n✅ Licencia de conducir válida\n✅ Depósito de garantía\n\nSi contratas conductor, no necesitas licencia propia.`;
  }

  // Horarios
  if (/horario|hora|cuando.*abren|atienden|abierto/.test(q)) {
    return `🕐 Horario de atención:\n\nLunes - Viernes: 8:00 - 18:00\nSábados: 9:00 - 14:00\nDomingos: Cerrado\n\nFuera de horario puedes escribirnos por WhatsApp.`;
  }

  // Ubicación
  if (/ubicacion|donde|direccion|malabo|oficina|local/.test(q)) {
    return `📍 Estamos en:\n\nMalabo 2, Bioko Norte\nGuinea Ecuatorial\n\n📞 +240 222 090 172\n📧 contacto@urbanrentals.com`;
  }

  // Contacto / WhatsApp
  if (/contacto|whatsapp|telefono|llamar|email|correo/.test(q)) {
    return `📱 Puedes contactarnos por:\n\n💬 WhatsApp: +240 222 090 172\n📧 Email: contacto@urbanrentals.com\n🌐 Web: urban-rentals.es\n\nEl botón verde de WhatsApp en la esquina te conecta directamente.`;
  }

  // Vehículos no disponibles / rentados
  if (/no.*disponible|rentado|ocupado|cuando.*libre|cuando.*disponible/.test(q)) {
    if (rentados.length === 0 && mant.length === 0) return "Actualmente todos nuestros vehículos están disponibles. ¿Cuál te interesa?";
    const noDisp = [...rentados, ...mant].map((v) => `• ${v.name} — ${v.status === "Rentado" ? "rentado actualmente" : "en mantenimiento"}`).join("\n");
    return `Los siguientes vehículos no están disponibles ahora:\n\n${noDisp}\n\nNo tenemos fecha exacta de liberación. Llámanos para más información: +240 222 090 172`;
  }

  // Respuesta por defecto
  return `Gracias por tu mensaje. Para darte la mejor atención, te recomiendo:\n\n📞 WhatsApp: +240 222 090 172\n📧 contacto@urbanrentals.com\n\nO selecciona una opción del menú para información rápida. ¿En qué más puedo ayudarte?`;
}

// ─── Handler principal ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastUserMsg: string = messages.findLast((m: { role: string }) => m.role === "user")?.content ?? "";

    // Obtener vehículos de la BD
    const vehicles = await prisma.vehicle.findMany({ orderBy: { name: "asc" } });

    // ── Intentar con IA si hay clave configurada ──────────────────────────────
    if (OPENROUTER_API_KEY) {
      const disponibles = vehicles.filter((v) => v.status === "Disponible");
      const rentados    = vehicles.filter((v) => v.status === "Rentado");
      const mantenimiento = vehicles.filter((v) => v.status === "Mantenimiento");

      const vehicleList = vehicles.map((v) => {
        const st = v.status === "Disponible" ? "✅ DISPONIBLE" : v.status === "Rentado" ? "🔴 RENTADO" : "🔧 MANTENIMIENTO";
        return `- ${v.name} | ${st} | ${v.type} | ${v.year} | ${v.seats} plazas | ${v.range} km autonomía | ${v.price.toLocaleString("es-ES")} XAF/día`;
      }).join("\n");

      const systemPrompt = `Eres el asistente virtual de Urban Rentals, empresa de alquiler de vehículos en Guinea Ecuatorial.

EMPRESA: Urban Rentals | Malabo 2, Bioko Norte | Tel: +240 222 090 172 | contacto@urbanrentals.com | Horario: L-V 8-18h, Sáb 9-14h

FLOTA ACTUAL (${vehicles.length} vehículos):
${vehicleList}

Disponibles: ${disponibles.length} | Rentados: ${rentados.length} | Mantenimiento: ${mantenimiento.length}

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE lo que se pregunta, sin añadir información no solicitada.
- Si preguntan por vehículos de X plazas, muestra SOLO los que tienen exactamente esas plazas.
- Si preguntan por un vehículo concreto, responde solo sobre ese vehículo.
- Máximo 5 líneas por respuesta. Sé directo y preciso.
- Usa solo datos reales de la flota de arriba. No inventes nada.
- Para reservas o preguntas que no puedas resolver, indica WhatsApp +240 222 090 172.
- No inventes fechas de liberación de vehículos rentados.`;

      const aiRes = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://urban-rentals.es",
          "X-Title": "Urban Rentals Chatbot",
        },
        body: JSON.stringify({
          model: "google/gemma-3-12b-it:free",
          // Gemma no soporta rol "system" — inyectamos contexto como primer turno user/assistant
          messages: [
            { role: "user", content: systemPrompt },
            { role: "assistant", content: "Entendido. Soy el asistente de Urban Rentals y usaré solo los datos proporcionados para responder." },
            ...messages,
          ],
          max_tokens: 400,
          temperature: 0.3,
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return NextResponse.json({ reply });
        console.warn("OpenRouter OK pero sin contenido en respuesta:", JSON.stringify(data));
      } else {
        const errText = await aiRes.text();
        console.warn(`OpenRouter falló [${aiRes.status}]: ${errText}`);
      }
      // Si la IA falla → fallback inteligente
      console.warn("Usando fallback inteligente");
    }

    // ── Fallback inteligente con datos reales ─────────────────────────────────
    const reply = buildSmartReply(lastUserMsg, vehicles);
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ reply: "Lo siento, ocurrió un error temporal. Por favor contáctanos al +240 222 090 172." });
  }
}
