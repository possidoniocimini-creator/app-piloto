import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeCycleProgress, habitsForWeekday, CYCLE_LENGTH_DAYS } from "@/lib/cycle-progress";
import { Avatar } from "@/components/Avatar";
import { ChecklistCard, type ChecklistItem } from "@/components/ChecklistCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed, cycle_start_date")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const [{ data: habits }, { data: entries }] = await Promise.all([
    supabase.from("habits").select("*").eq("user_id", user.id).eq("active", true),
    supabase.from("checklist_entries").select("*").eq("user_id", user.id),
  ]);

  const allHabits = habits ?? [];
  const allEntries = entries ?? [];

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const todayWeekday = today.getDay();

  const scheduledToday = habitsForWeekday(allHabits, todayWeekday);

  const items: ChecklistItem[] = scheduledToday.map((habit) => {
    const entry = allEntries.find((e) => e.habit_id === habit.id && e.entry_date === todayKey);
    return {
      habitId: habit.id,
      title: habit.title,
      description: habit.description,
      completed: entry?.completed ?? false,
    };
  });

  const progress = computeCycleProgress(allHabits, allEntries, profile.cycle_start_date);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/50">Olá, {profile.full_name.split(" ")[0]}</p>
        <h1 className="text-2xl font-semibold text-white">Sua jornada de hoje</h1>
      </div>

      <div className="card flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Avatar fillPercent={progress.fillPercent} goalReached={progress.goalReached} />
        <div className="grid flex-1 grid-cols-2 gap-4 sm:pl-8">
          <div>
            <p className="text-3xl font-bold text-white">{progress.streakDays}</p>
            <p className="text-sm text-white/50">de {CYCLE_LENGTH_DAYS} dias perfeitos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{progress.misses}/2</p>
            <p className="text-sm text-white/50">erros até reiniciar o ciclo</p>
          </div>
          {allHabits.length === 0 && (
            <p className="col-span-2 text-sm text-accent-gold">
              Você ainda não tem hábitos cadastrados. Volte na sessão 4 do onboarding para
              adicioná-los.
            </p>
          )}
        </div>
      </div>

      <ChecklistCard items={items} userId={user.id} today={todayKey} />
    </div>
  );
}
