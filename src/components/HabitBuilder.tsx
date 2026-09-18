"use client";

import { WEEKDAY_LABELS } from "@/lib/onboarding-content";

export type HabitDraft = {
  id: string; // uuid real (existente) ou id temporário gerado no client
  title: string;
  description: string;
  weekdays: number[];
  isNew: boolean;
};

function randomId() {
  return `temp-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function createEmptyHabit(): HabitDraft {
  return {
    id: randomId(),
    title: "",
    description: "",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    isNew: true,
  };
}

export function HabitBuilder({
  habits,
  onChange,
}: {
  habits: HabitDraft[];
  onChange: (habits: HabitDraft[]) => void;
}) {
  function updateHabit(id: string, patch: Partial<HabitDraft>) {
    onChange(habits.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  function toggleWeekday(id: string, day: number) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const weekdays = habit.weekdays.includes(day)
      ? habit.weekdays.filter((d) => d !== day)
      : [...habit.weekdays, day].sort();
    updateHabit(id, { weekdays });
  }

  function removeHabit(id: string) {
    onChange(habits.filter((h) => h.id !== id));
  }

  function addHabit() {
    onChange([...habits, createEmptyHabit()]);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="label mb-0">Seus hábitos diários dos 21 dias</p>
        <p className="helper-text">
          Cada hábito que você criar aqui vira uma tarefa no seu checklist diário, nos dias da
          semana que você escolher.
        </p>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => (
          <div key={habit.id} className="rounded-xl border border-base-border bg-base-surface2 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Ex: Treinar 30 minutos"
                  className="input-field"
                  value={habit.title}
                  onChange={(e) => updateHabit(habit.id, { title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Detalhe (opcional): como, quando, quanto"
                  className="input-field text-sm"
                  value={habit.description}
                  onChange={(e) => updateHabit(habit.id, { description: e.target.value })}
                />
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAY_LABELS.map((label, day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(habit.id, day)}
                      className={`h-8 w-10 rounded-lg text-xs font-medium transition ${
                        habit.weekdays.includes(day)
                          ? "bg-brand text-white"
                          : "bg-base-bg text-white/40 hover:text-white/70"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeHabit(habit.id)}
                className="text-sm text-white/30 hover:text-accent-danger"
                aria-label="Remover hábito"
              >
                remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addHabit} className="btn-secondary w-full">
        + Adicionar hábito
      </button>
    </div>
  );
}
