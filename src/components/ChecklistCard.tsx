"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type ChecklistItem = {
  habitId: string;
  title: string;
  description: string | null;
  completed: boolean;
};

export function ChecklistCard({
  items,
  userId,
  today,
}: {
  items: ChecklistItem[];
  userId: string;
  today: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [localItems, setLocalItems] = useState(items);
  const [isPending, startTransition] = useTransition();

  async function toggle(habitId: string, completed: boolean) {
    setLocalItems((prev) =>
      prev.map((item) => (item.habitId === habitId ? { ...item, completed } : item))
    );

    const { error } = await supabase.from("checklist_entries").upsert(
      {
        user_id: userId,
        habit_id: habitId,
        entry_date: today,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "habit_id,entry_date" }
    );

    if (error) {
      setLocalItems((prev) =>
        prev.map((item) => (item.habitId === habitId ? { ...item, completed: !completed } : item))
      );
      return;
    }

    startTransition(() => router.refresh());
  }

  if (localItems.length === 0) {
    return (
      <div className="card text-center text-white/50">
        Nenhum hábito agendado para hoje. Revise seus hábitos na sessão 4 do onboarding.
      </div>
    );
  }

  const completedCount = localItems.filter((i) => i.completed).length;

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Checklist de hoje</h2>
        <span className="text-sm text-white/50">
          {completedCount}/{localItems.length}
        </span>
      </div>
      <ul className="space-y-2">
        {localItems.map((item) => (
          <li key={item.habitId}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                item.completed
                  ? "border-accent-success/40 bg-accent-success/10"
                  : "border-base-border bg-base-surface2"
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                disabled={isPending}
                onChange={(e) => toggle(item.habitId, e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-brand"
              />
              <span>
                <span
                  className={`block font-medium ${
                    item.completed ? "text-white/60 line-through" : "text-white"
                  }`}
                >
                  {item.title}
                </span>
                {item.description && (
                  <span className="mt-0.5 block text-sm text-white/40">{item.description}</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
