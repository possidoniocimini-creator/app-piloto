import type { Database } from "@/lib/database.types";

type Habit = Database["public"]["Tables"]["habits"]["Row"];
type ChecklistEntry = Database["public"]["Tables"]["checklist_entries"]["Row"];

type DayStatus = "none" | "perfect" | "partial" | "missed" | "future";

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayStatus(dateKey: string, habits: Habit[], entries: ChecklistEntry[], todayKey: string): DayStatus {
  if (dateKey > todayKey) return "future";

  const weekday = new Date(dateKey + "T00:00:00Z").getUTCDay();
  const scheduled = habits.filter((h) => h.active && h.weekdays.includes(weekday));
  if (scheduled.length === 0) return "none";

  const completedIds = new Set(
    entries.filter((e) => e.completed && e.entry_date === dateKey).map((e) => e.habit_id)
  );
  const completedCount = scheduled.filter((h) => completedIds.has(h.id)).length;

  if (completedCount === scheduled.length) return "perfect";
  if (completedCount > 0) return "partial";
  return "missed";
}

const STATUS_CLASS: Record<DayStatus, string> = {
  perfect: "bg-flame",
  partial: "bg-accent-gold/50",
  missed: "bg-base-surface2 border border-accent-danger/30",
  none: "bg-base-surface2",
  future: "bg-transparent",
};

export function CheckinCalendar({
  habits,
  entries,
  days = 35,
}: {
  habits: Habit[];
  entries: ChecklistEntry[];
  days?: number;
}) {
  const today = new Date();
  const todayKey = toDateKey(today);

  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    const dateKey = toDateKey(d);
    return { dateKey, status: dayStatus(dateKey, habits, entries, todayKey) };
  });

  const consideredDays = cells.filter((c) => c.status !== "none" && c.status !== "future");
  const perfectCount = consideredDays.filter((c) => c.status === "perfect").length;
  const rate = consideredDays.length > 0 ? Math.round((perfectCount / consideredDays.length) * 100) : 0;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Últimos {days} dias</h2>
        <span className="text-sm text-white/50">{rate}% de dias perfeitos</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c) => (
          <div
            key={c.dateKey}
            title={c.dateKey}
            className={`aspect-square rounded-md ${STATUS_CLASS[c.status]}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-flame" /> Dia perfeito
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent-gold/50" /> Parcial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-accent-danger/30 bg-base-surface2" /> Não fez
        </span>
      </div>
    </div>
  );
}
