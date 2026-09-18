"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LessonCompleteButton({
  userId,
  lessonId,
  initialCompleted,
}: {
  userId: string;
  lessonId: string;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !completed;

    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: next,
        completed_at: next ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (!error) {
      setCompleted(next);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={completed ? "btn-secondary" : "btn-primary"}
    >
      {completed ? "Marcada como concluída ✓" : "Marcar como concluída"}
    </button>
  );
}
