"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, ChevronDown, Loader2 } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  role: "assistant" | "user";
  text: string;
  options?: string[];
}

// Opciones rápidas de bienvenida
const QUICK_OPTIONS = [
  "¿Qué vehículos están disponibles?",
  "Ver precios",
  "¿Cómo reservar?",
  "Horarios y ubicación",
  "Contacto WhatsApp",
];

let msgId = 0;
const newId = () => ++msgId;

const WELCOME: Message = {
  id: newId(),
  role: "assistant",
  text: "¡Hola! 👋 Soy el asistente de **Urban Rentals**. Puedo ayudarte con información actualizada sobre nuestra flota, disponibilidad y precios. ¿En qué puedo ayudarte?",
  options: QUICK_OPTIONS,
};

// ─── Componente ───────────────────────────────────────────────────────────────
export const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: newId(), role: "user", text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      // Construir historial para la API (sin el mensaje de bienvenida del sistema)
      const history = updated
        .filter((m) => m.id !== WELCOME.id)
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      const replyText = data.reply ?? "Lo siento, ocurrió un error. Por favor contáctanos por WhatsApp.";

      const botMsg: Message = {
        id: newId(),
        role: "assistant",
        text: replyText,
        // Mostrar opciones rápidas solo en la primera respuesta del bot
        options: updated.filter((m) => m.role === "assistant").length === 1 ? QUICK_OPTIONS : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: "Lo siento, no pude conectarme. Por favor contáctanos directamente al +240 222 090 172.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) sendMessage(input);
  };

  // Renderiza el texto con negritas básicas (**texto**)
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
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
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: "70vh" }}
        >
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Asistente Urban Rentals</p>
              <p className="text-blue-200 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                Con IA · Datos en tiempo real
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="text-blue-200 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line shadow-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                  }`}
                >
                  {renderText(msg.text)}
                </div>
                {msg.role === "assistant" && msg.options && msg.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 max-w-[85%]">
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => sendMessage(opt)}
                        disabled={loading}
                        className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full transition-colors disabled:opacity-50"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Indicador pensando */}
            {loading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                  <span className="text-xs text-gray-500">Consultando datos...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
