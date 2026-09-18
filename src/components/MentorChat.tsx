"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/OnboardingProgress";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function MentorChat({
  sessionNumber,
  totalSessions,
  title,
  subtitle,
  initialMessages,
}: {
  sessionNumber: number;
  totalSessions: number;
  title: string;
  subtitle: string;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionNumber, message: text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Algo deu errado.");
      }

      const data: { reply: string; sessionCompleted: boolean; nextPath: string | null } =
        await res.json();

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      if (data.sessionCompleted) {
        setCompleted(true);
        if (data.nextPath) {
          setTimeout(() => {
            router.push(data.nextPath!);
            router.refresh();
          }, 2500);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar. Tente de novo.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    void sendMessage(text);
  }

  return (
    <div className="flex min-h-[75vh] flex-col">
      <OnboardingProgress currentSession={sessionNumber} totalSessions={totalSessions} />

      <div>
        <p className="text-sm font-medium text-brand-light">
          Etapa {sessionNumber} de {totalSessions}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-1 text-white/60">{subtitle}</p>
      </div>

      <div className="card mt-6 flex flex-1 flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
            <p className="max-w-sm text-white/60">
              Seu mentor vai te guiar por essa sessão, explicando os conceitos e te ajudando a
              colocar tudo no papel — como numa mentoria de verdade.
            </p>
            <button
              onClick={() => sendMessage("Vamos começar.")}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Preparando..." : "Começar sessão"}
            </button>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
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

        {completed && (
          <div className="rounded-xl border border-accent-gold/40 bg-accent-gold/10 px-4 py-3 text-center text-sm text-accent-gold">
            Sessão concluída! Te levando para a próxima etapa...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-accent-danger">{error}</p>}

      {messages.length > 0 && !completed && (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            className="input-field"
            placeholder="Escreva sua resposta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}
