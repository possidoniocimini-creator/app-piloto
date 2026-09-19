"use client";

import { useState } from "react";

export function JournalForm({
  initial,
}: {
  initial: { wentWell: string; wentWrong: string; difficulty: string };
}) {
  const [wentWell, setWentWell] = useState(initial.wentWell);
  const [wentWrong, setWentWrong] = useState(initial.wentWrong);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

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

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
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
      {saved && !error && <p className="text-sm text-accent-success">Diário salvo.</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
