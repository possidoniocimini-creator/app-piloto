"use client";

import { useState } from "react";
import Link from "next/link";

type Recommendation = {
  recommendedSlug: string | null;
  recommendedTitle: string | null;
  recommendedNote: string | null;
};

export function JournalForm({
  initial,
  initialRecommendation,
}: {
  initial: { wentWell: string; wentWrong: string; difficulty: string };
  initialRecommendation: Recommendation | null;
}) {
  const [wentWell, setWentWell] = useState(initial.wentWell);
  const [wentWrong, setWentWrong] = useState(initial.wentWrong);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(initialRecommendation);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wentWell, wentWrong, difficulty }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Não foi possível salvar.");
      }

      const data: Recommendation = await res.json();
      setRecommendation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="went-well">
            O que deu certo hoje?
          </label>
          <textarea
            id="went-well"
            className="input-field min-h-[80px]"
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="went-wrong">
            O que deu errado ou você não conseguiu fazer?
          </label>
          <textarea
            id="went-wrong"
            className="input-field min-h-[80px]"
            value={wentWrong}
            onChange={(e) => setWentWrong(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="difficulty">
            O que foi difícil hoje?
          </label>
          <textarea
            id="difficulty"
            className="input-field min-h-[80px]"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-accent-danger">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar e receber recomendação"}
          </button>
        </div>
      </form>

      {recommendation?.recommendedSlug && (
        <div className="card border-accent-gold/40 bg-accent-gold/10">
          <p className="text-sm font-medium text-accent-gold">Recomendação de hoje</p>
          <p className="mt-1 text-white">{recommendation.recommendedTitle}</p>
          {recommendation.recommendedNote && (
            <p className="mt-1 text-sm text-white/70">{recommendation.recommendedNote}</p>
          )}
          <Link
            href={`/aulas/${recommendation.recommendedSlug}`}
            className="btn-primary mt-4 inline-flex"
          >
            Ver aula
          </Link>
        </div>
      )}
    </div>
  );
}
