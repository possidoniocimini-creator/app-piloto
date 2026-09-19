"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/database.types";

type Habit = Database["public"]["Tables"]["habits"]["Row"];
type ChecklistEntry = Database["public"]["Tables"]["checklist_entries"]["Row"];

type DayPoint = { dateKey: string; label: string; value: number | null };

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

const WEEKDAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function buildDailyCompletion(habits: Habit[], entries: ChecklistEntry[], days: number): DayPoint[] {
  const today = new Date();
  const activeHabits = habits.filter((h) => h.active);

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    const dateKey = toDateKey(d);
    const weekday = d.getUTCDay();

    const scheduled = activeHabits.filter((h) => h.weekdays.includes(weekday));
    if (scheduled.length === 0) {
      return { dateKey, label: `${d.getUTCDate()} ${WEEKDAY_SHORT[weekday]}`, value: null };
    }

    const completedIds = new Set(
      entries.filter((e) => e.completed && e.entry_date === dateKey).map((e) => e.habit_id)
    );
    const completedCount = scheduled.filter((h) => completedIds.has(h.id)).length;
    const value = Math.round((completedCount / scheduled.length) * 100);

    return { dateKey, label: `${d.getUTCDate()} ${WEEKDAY_SHORT[weekday]}`, value };
  });
}

const WIDTH = 600;
const HEIGHT = 160;
const PAD_X = 8;
const PAD_TOP = 24;
const PAD_BOTTOM = 8;

export function ProgressChart({
  habits,
  entries,
  days = 30,
}: {
  habits: Habit[];
  entries: ChecklistEntry[];
  days?: number;
}) {
  const points = useMemo(() => buildDailyCompletion(habits, entries, days), [habits, entries, days]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plottable = points.filter((p) => p.value !== null) as (DayPoint & { value: number })[];
  const average = plottable.length > 0 ? Math.round(plottable.reduce((s, p) => s + p.value, 0) / plottable.length) : 0;
  const best = plottable.reduce<(DayPoint & { value: number }) | null>(
    (acc, p) => (!acc || p.value > acc.value ? p : acc),
    null
  );

  const innerWidth = WIDTH - PAD_X * 2;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  function xFor(i: number) {
    return PAD_X + i * stepX;
  }
  function yFor(value: number) {
    return PAD_TOP + innerHeight * (1 - value / 100);
  }

  // Monta segmentos contínuos (quebra a linha nos dias sem hábito agendado)
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  points.forEach((p, i) => {
    if (p.value === null) {
      if (current.length > 0) segments.push(current);
      current = [];
      return;
    }
    current.push({ x: xFor(i), y: yFor(p.value) });
  });
  if (current.length > 0) segments.push(current);

  function pathFor(seg: { x: number; y: number }[]) {
    return seg.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
  }
  function areaFor(seg: { x: number; y: number }[]) {
    const baseline = PAD_TOP + innerHeight;
    return `M${seg[0].x.toFixed(1)},${baseline} ${seg
      .map((pt) => `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
      .join(" ")} L${seg[seg.length - 1].x.toFixed(1)},${baseline} Z`;
  }

  const lastPlottableIndex = [...points].reverse().findIndex((p) => p.value !== null);
  const lastIndex = lastPlottableIndex === -1 ? -1 : points.length - 1 - lastPlottableIndex;

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const i = Math.round((relX - PAD_X) / (stepX || 1));
    setHoverIndex(Math.max(0, Math.min(points.length - 1, i)));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Evolução (últimos {days} dias)</h2>
        <span className="text-sm text-white/50">Média: {average}%</span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`Gráfico de conclusão diária dos hábitos nos últimos ${days} dias, média de ${average}%`}
      >
        {/* Linhas de referência (25/50/75%) recessivas */}
        {[25, 50, 75].map((g) => (
          <line
            key={g}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={yFor(g)}
            y2={yFor(g)}
            className="stroke-base-border"
            strokeWidth={1}
          />
        ))}

        {segments.map((seg, i) => (
          <g key={i}>
            <path d={areaFor(seg)} className="fill-brand/10" />
            <path d={pathFor(seg)} className="fill-none stroke-brand" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}

        {/* Marcador do melhor dia */}
        {best && (
          <g>
            <circle cx={xFor(points.indexOf(best))} cy={yFor(best.value)} r={5} className="fill-accent-gold" />
            <circle
              cx={xFor(points.indexOf(best))}
              cy={yFor(best.value)}
              r={7}
              className="fill-none stroke-base-surface"
              strokeWidth={2}
            />
            <text
              x={xFor(points.indexOf(best))}
              y={yFor(best.value) - 12}
              textAnchor="middle"
              className="fill-white/60 text-[9px]"
            >
              melhor dia
            </text>
          </g>
        )}

        {/* Marcador do último dia com dado */}
        {lastIndex >= 0 && points[lastIndex].value !== null && (
          <>
            <circle cx={xFor(lastIndex)} cy={yFor(points[lastIndex].value as number)} r={5} className="fill-brand" />
            <circle
              cx={xFor(lastIndex)}
              cy={yFor(points[lastIndex].value as number)}
              r={7}
              className="fill-none stroke-base-surface"
              strokeWidth={2}
            />
          </>
        )}

        {/* Crosshair + hit area */}
        {hoverIndex !== null && (
          <line
            x1={xFor(hoverIndex)}
            x2={xFor(hoverIndex)}
            y1={PAD_TOP}
            y2={PAD_TOP + innerHeight}
            className="stroke-white/20"
            strokeWidth={1}
          />
        )}
      </svg>

      {hovered && (
        <div className="rounded-lg border border-base-border bg-base-surface2 px-3 py-2 text-sm">
          <span className="text-white/50">{hovered.label}: </span>
          <span className="font-semibold text-white">
            {hovered.value === null ? "sem hábito agendado" : `${hovered.value}%`}
          </span>
        </div>
      )}

      {best && (
        <p className="text-xs text-white/40">
          Melhor dia do período: {best.label} ({best.value}%)
        </p>
      )}
    </div>
  );
}
