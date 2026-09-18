import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AulasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase.from("lessons").select("*").order("order_index"),
    supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id),
  ]);

  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Aulas</h1>
        <p className="text-white/50">
          Reprograme sua mente: dopamina, disciplina, persistência e mais.
        </p>
      </div>

      <div className="space-y-3">
        {(lessons ?? []).map((lesson) => {
          const done = completedIds.has(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/aulas/${lesson.slug}`}
              className="card flex items-center justify-between gap-4 transition hover:border-brand"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-brand-light">
                  {lesson.category}
                </p>
                <h2 className="mt-1 font-semibold text-white">{lesson.title}</h2>
                <p className="mt-1 text-sm text-white/50">{lesson.summary}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  done ? "bg-accent-success/20 text-accent-success" : "bg-base-surface2 text-white/40"
                }`}
              >
                {done ? "Concluída" : "Pendente"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
