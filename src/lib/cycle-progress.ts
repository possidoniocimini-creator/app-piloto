import type { Database } from "@/lib/database.types";

type Habit = Database["public"]["Tables"]["habits"]["Row"];
type ChecklistEntry = Database["public"]["Tables"]["checklist_entries"]["Row"];

const CYCLE_LENGTH_DAYS = 21;
const MAX_MISSES_BEFORE_RESET = 2;

export type CycleProgress = {
  fillPercent: number;
  streakDays: number;
  misses: number;
  effectiveCycleStart: string;
  goalReached: boolean;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey: string, days: number) {
  const date = new Date(dateKey + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

/**
 * Simula o ciclo de 21 dias seguindo a regra do método: um "dia perfeito" é aquele em
 * que todos os hábitos agendados pra aquele dia da semana foram concluídos. Errar 2 dias
 * (não necessariamente seguidos) reinicia o ciclo do zero, exatamente como no método original.
 */
export function computeCycleProgress(
  habits: Habit[],
  entries: ChecklistEntry[],
  cycleStartDate: string | null
): CycleProgress {
  const activeHabits = habits.filter((h) => h.active);
  const todayKey = toDateKey(new Date());

  if (!cycleStartDate || activeHabits.length === 0) {
    return {
      fillPercent: 0,
      streakDays: 0,
      misses: 0,
      effectiveCycleStart: cycleStartDate ?? todayKey,
      goalReached: false,
    };
  }

  const completedByHabitAndDate = new Set(
    entries.filter((e) => e.completed).map((e) => `${e.habit_id}__${e.entry_date}`)
  );

  let effectiveCycleStart = cycleStartDate;
  let streakDays = 0;
  let misses = 0;
  let cursor = cycleStartDate;

  while (cursor < todayKey) {
    const weekday = new Date(cursor + "T00:00:00Z").getUTCDay();
    const scheduledHabits = activeHabits.filter((h) => h.weekdays.includes(weekday));

    if (scheduledHabits.length > 0) {
      const perfectDay = scheduledHabits.every((h) =>
        completedByHabitAndDate.has(`${h.id}__${cursor}`)
      );

      if (perfectDay) {
        streakDays += 1;
      } else {
        misses += 1;
        if (misses >= MAX_MISSES_BEFORE_RESET) {
          effectiveCycleStart = addDays(cursor, 1);
          streakDays = 0;
          misses = 0;
        }
      }
    }

    cursor = addDays(cursor, 1);
  }

  const fillPercent = Math.min(100, Math.round((streakDays / CYCLE_LENGTH_DAYS) * 100));

  return {
    fillPercent,
    streakDays,
    misses,
    effectiveCycleStart,
    goalReached: streakDays >= CYCLE_LENGTH_DAYS,
  };
}

export type LongTermProgress = {
  fillPercent: number;
  perfectDays: number;
  goalDurationDays: number;
  goalReached: boolean;
};

/**
 * Progresso do avatar de longo prazo: acumula os "dias perfeitos" desde o início do
 * ciclo (sem reset — diferente da conquista de 21 dias) e divide pelo prazo que a
 * própria pessoa definiu pra o objetivo dela (goal_duration_days).
 */
export function computeLongTermProgress(
  habits: Habit[],
  entries: ChecklistEntry[],
  cycleStartDate: string | null,
  goalDurationDays: number
): LongTermProgress {
  const activeHabits = habits.filter((h) => h.active);
  const todayKey = toDateKey(new Date());
  const safeDuration = goalDurationDays > 0 ? goalDurationDays : 180;

  if (!cycleStartDate || activeHabits.length === 0) {
    return { fillPercent: 0, perfectDays: 0, goalDurationDays: safeDuration, goalReached: false };
  }

  const completedByHabitAndDate = new Set(
    entries.filter((e) => e.completed).map((e) => `${e.habit_id}__${e.entry_date}`)
  );

  let perfectDays = 0;
  let cursor = cycleStartDate;

  while (cursor < todayKey) {
    const weekday = new Date(cursor + "T00:00:00Z").getUTCDay();
    const scheduledHabits = activeHabits.filter((h) => h.weekdays.includes(weekday));

    if (scheduledHabits.length > 0) {
      const perfectDay = scheduledHabits.every((h) =>
        completedByHabitAndDate.has(`${h.id}__${cursor}`)
      );
      if (perfectDay) perfectDays += 1;
    }

    cursor = addDays(cursor, 1);
  }

  const fillPercent = Math.min(100, Math.round((perfectDays / safeDuration) * 100));

  return { fillPercent, perfectDays, goalDurationDays: safeDuration, goalReached: fillPercent >= 100 };
}

export function habitsForWeekday(habits: Habit[], weekday: number) {
  return habits.filter((h) => h.active && h.weekdays.includes(weekday));
}

export { CYCLE_LENGTH_DAYS };
