"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OnboardingModePicker({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<"chat" | "lesson" | null>(null);

  async function choose(mode: "chat" | "lesson") {
    setLoading(mode);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_mode: mode })
      .eq("id", userId);

    if (!error) {
      router.push("/onboarding/sessao-1");
      router.refresh();
    } else {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-white">Como você prefere fazer o onboarding?</h1>
        <p className="mt-1 text-white/60">Você passa pelas mesmas 5 sessões nos dois jeitos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => choose("chat")}
          disabled={loading !== null}
          className="card text-left transition hover:border-brand disabled:opacity-50"
        >
          <p className="text-lg font-semibold text-white">Mentor IA em chat</p>
          <p className="mt-2 text-sm text-white/60">
            Converse em tempo real com o mentor: ele ensina cada conceito e monta sua agenda com
            você, pergunta a pergunta.
          </p>
          {loading === "chat" && <p className="mt-3 text-xs text-brand-light">Preparando...</p>}
        </button>

        <button
          onClick={() => choose("lesson")}
          disabled={loading !== null}
          className="card text-left transition hover:border-brand disabled:opacity-50"
        >
          <p className="text-lg font-semibold text-white">Aula + respostas</p>
          <p className="mt-2 text-sm text-white/60">
            Leia (ou assista) o conteúdo de cada sessão e responda num formulário. Sem custo de
            IA — os hábitos são criados automaticamente conforme você preenche.
          </p>
          {loading === "lesson" && <p className="mt-3 text-xs text-brand-light">Preparando...</p>}
        </button>
      </div>
    </div>
  );
}
