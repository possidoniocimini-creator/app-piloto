import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonCompleteButton } from "@/components/LessonCompleteButton";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!lesson) {
    notFound();
  }

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <Link href="/aulas" className="text-sm text-white/50 hover:text-white">
        ← Voltar para as aulas
      </Link>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-light">
          {lesson.category}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{lesson.title}</h1>
      </div>

      <div className="card">
        <div className="whitespace-pre-line leading-relaxed text-white/80">{lesson.content}</div>
      </div>

      <LessonCompleteButton
        userId={user.id}
        lessonId={lesson.id}
        initialCompleted={progress?.completed ?? false}
      />
    </div>
  );
}
