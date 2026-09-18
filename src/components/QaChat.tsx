"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function QaChat({ initialMessages }: { initialMessages: ChatMessage[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Algo deu errado.");
      }
      const data: { reply: string } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar. Tente de novo.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tire suas dúvidas</h1>
        <p className="text-white/60">Pergunte qualquer coisa sobre o método, a qualquer hora.</p>
      </div>

      <div className="card mt-6 flex flex-1 flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && (
          <p className="flex flex-1 items-center justify-center text-center text-white/40">
            Nenhuma pergunta ainda — manda a primeira aí embaixo.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-flame text-white"
                  : "border border-base-border bg-base-surface2 text-white/90"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-base-border bg-base-surface2 px-4 py-3 text-sm text-white/40">
              digitando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-accent-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          className="input-field"
          placeholder="Sua pergunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
          Enviar
        </button>
      </form>
    </div>
  );
}
