"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, ChevronDown } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  options?: string[];
}

// ─── Base de conocimiento (reemplazar con llamada a IA en el futuro) ───────────
function getBotResponse(userInput: string): { text: string; options?: string[] } {
  const input = userInput.toLowerCase().trim();

  if (matchAny(input, ["hola", "buenas", "buenos días", "buenas tardes", "buenas noches", "hi", "hello"])) {
    return {
      text: "¡Hola! 👋 Soy el asistente virtual de Urban Rentals. ¿En qué puedo ayudarte hoy?",
      options: MAIN_MENU,
    };
  }

  if (matchAny(input, ["vehiculo", "vehículo", "coche", "carro", "auto", "flota", "disponible"])) {
    return {
      text: "🚗 Contamos con una flota variada: sedanes, SUVs, camionetas y vehículos 4x4. Todos con mantenimiento al día y en excelente estado.\n\n¿Quieres más información?",
      options: ["Ver precios", "Hacer una reserva", "Menú principal"],
    };
  }

  if (matchAny(input, ["precio", "tarifa", "costo", "cuánto", "cuanto", "rate", "cuesta"])) {
    return {
      text: "💰 Nuestras tarifas varían según el vehículo y la duración del alquiler:\n\n• Sedán desde 35.000 XAF/día\n• SUV desde 55.000 XAF/día\n• 4x4 desde 75.000 XAF/día\n\nIncluyendo seguro básico. ¿Te gustaría hacer una reserva?",
      options: ["Hacer una reserva", "¿Qué incluye el alquiler?", "Menú principal"],
    };
  }

  if (matchAny(input, ["reserva", "reservar", "alquilar", "contratar", "rentar", "booking"])) {
    return {
      text: "📋 Para hacer tu reserva puedes:\n\n1️⃣ Completar el formulario en nuestra web\n2️⃣ Llamarnos al +240 222 090 172\n3️⃣ Enviarnos un WhatsApp\n\nNecesitamos: fechas, tipo de vehículo y si deseas conductor incluido.",
      options: ["Contactar por WhatsApp", "¿Qué documentos necesito?", "Menú principal"],
    };
  }

  if (matchAny(input, ["documento", "requisito", "licencia", "carnet", "pasaporte", "dni"])) {
    return {
      text: "📄 Documentos necesarios para alquilar:\n\n✅ Cédula de identidad o pasaporte vigente\n✅ Licencia de conducir válida\n✅ Depósito de garantía\n\nSi deseas conductor incluido, no necesitas licencia.",
      options: ["Hacer una reserva", "¿Qué incluye el alquiler?", "Menú principal"],
    };
  }

  if (matchAny(input, ["incluye", "qué incluye", "seguro", "combustible", "conductor"])) {
    return {
      text: "📦 Nuestros alquileres incluyen:\n\n✅ Seguro básico de vehículo\n✅ Asistencia en carretera 24h\n\n➕ Opcionales con costo adicional:\n• Conductor profesional\n• Combustible\n• Peajes",
      options: ["Ver precios", "Hacer una reserva", "Menú principal"],
    };
  }

  if (matchAny(input, ["horario", "hora", "cuando", "cuándo", "abierto", "abren", "atienden"])) {
    return {
      text: "🕐 Horario de atención:\n\nLunes a Viernes: 8:00 - 18:00\nSábados: 9:00 - 14:00\nDomingos: Cerrado\n\nPara urgencias fuera de horario, contáctanos por WhatsApp.",
      options: ["Contactar por WhatsApp", "Hacer una reserva", "Menú principal"],
    };
  }

  if (matchAny(input, ["ubicacion", "ubicación", "dirección", "donde", "dónde", "malabo", "bata", "oficina"])) {
    return {
      text: "📍 Estamos ubicados en:\n\nMalabo 2, Bioko Norte\nGuinea Ecuatorial\n\nPuedes contactarnos para indicaciones precisas.",
      options: ["Contactar por WhatsApp", "Ver horarios", "Menú principal"],
    };
  }

  if (matchAny(input, ["whatsapp", "contactar", "contacto", "llamar", "teléfono", "telefono"])) {
    return {
      text: "📱 Puedes contactarnos directamente:\n\n📞 WhatsApp: +240 222 090 172\n📧 Email: contacto@urbanrentals.com\n🌐 Web: urban-rentals.es\n\nHaz clic en el botón verde de WhatsApp en la esquina de la pantalla.",
      options: ["Menú principal"],
    };
  }

  if (matchAny(input, ["gracias", "ok", "perfecto", "bien", "listo", "excelente", "genial"])) {
    return {
      text: "¡De nada! 😊 Estamos para ayudarte. Si necesitas algo más, aquí estaré. ¡Que tengas un excelente día!",
      options: ["Menú principal"],
    };
  }

  if (matchAny(input, ["adios", "adiós", "bye", "hasta luego", "chao", "ciao"])) {
    return {
      text: "¡Hasta pronto! 👋 Gracias por contactar a Urban Rentals. Será un placer atenderte cuando lo necesites.",
      options: [],
    };
  }

  // Respuesta por defecto
  return {
    text: "Entiendo tu consulta. Para darte la mejor atención, te recomiendo contactar directamente con nuestro equipo por WhatsApp o selecciona una opción del menú.",
    options: [...MAIN_MENU, "Contactar por WhatsApp"],
  };
}

const MAIN_MENU = [
  "Ver vehículos",
  "Precios y tarifas",
  "Hacer una reserva",
  "Horarios",
  "Ubicación",
  "Contacto",
];

function matchAny(input: string, keywords: string[]): boolean {
  return keywords.some((kw) => input.includes(kw));
}

// ─── Componente principal ─────────────────────────────────────────────────────
let messageIdCounter = 0;
function newId() { return ++messageIdCounter; }

const WELCOME: Message = {
  id: newId(),
  from: "bot",
  text: "¡Hola! 👋 Soy el asistente de **Urban Rentals**. Estoy aquí para ayudarte con información sobre nuestros vehículos, reservas y más. ¿En qué puedo ayudarte?",
  options: MAIN_MENU,
};

export const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: newId(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simula tiempo de respuesta (reemplazar con fetch a API de IA)
    setTimeout(() => {
      const { text: botText, options } = getBotResponse(text);
      const botMsg: Message = { id: newId(), from: "bot", text: botText, options };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage(input);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-24 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Abrir asistente virtual"
      >
        {open ? <ChevronDown className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Ventana de chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: "70vh" }}>

          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Asistente Urban Rentals</p>
              <p className="text-blue-200 text-xs">En línea · Responde al instante</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-blue-200 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: 200 }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line shadow-sm ${
                  msg.from === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                }`}>
                  {msg.text}
                </div>
                {/* Opciones rápidas */}
                {msg.from === "bot" && msg.options && msg.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 max-w-[85%]">
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => sendMessage(opt)}
                        className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Indicador "escribiendo..." */}
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                  <span className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu mensaje..."
              className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
