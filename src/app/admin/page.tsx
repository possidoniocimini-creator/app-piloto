import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeLongTermProgress, computeCycleProgress } from "@/lib/cycle-progress";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  is_demo: boolean;
  is_admin: boolean;
  goal_duration_days: number;
  vision_image_url: string | null;
};
type Habit = Database["public"]["Tables"]["habits"]["Row"];
type ChecklistEntry = Database["public"]["Tables"]["checklist_entries"]["Row"];

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!myProfile?.is_admin) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="text-white/70">Esta página é restrita ao administrador da mentoria.</p>
      </div>
    );
  }

  const [{ data: profiles }, { data: habits }, { data: entries }] = await Promise.all([
    supabase.rpc("get_admin_profiles"),
    supabase.rpc("get_admin_habits"),
    supabase.rpc("get_admin_checklist_entries"),
  ]);

  const allProfiles = (profiles ?? []) as Profile[];
  const allHabits = (habits ?? []) as Habit[];
  const allEntries = (entries ?? []) as ChecklistEntry[];

  const rows = allProfiles
    .filter((p) => p.onboarding_completed)
    .map((p) => {
      const userHabits = allHabits.filter((h) => h.user_id === p.id && h.active);
      const userEntries = allEntries.filter((e) => e.user_id === p.id);
      const longTerm = computeLongTermProgress(userHabits, userEntries, p.cycle_start_date, p.goal_duration_days);
      const formation = computeCycleProgress(userHabits, userEntries, p.cycle_start_date);
      return { profile: p, habitsCount: userHabits.length, longTerm, formation };
    })
    .sort((a, b) => Number(a.profile.is_demo) - Number(b.profile.is_demo) || b.longTerm.fillPercent - a.longTerm.fillPercent);

  const realCount = rows.filter((r) => !r.profile.is_demo).length;
  const demoCount = rows.length - realCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Painel do mentor</h1>
        <p className="text-white/60">
          {realCount} aluno(s) real(is) · {demoCount} conta(s) de demonstração
        </p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-base-border text-white/50">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Progresso do objetivo</th>
              <th className="px-4 py-3 font-medium">Hábito formado (21d)</th>
              <th className="px-4 py-3 font-medium">Hábitos ativos</th>
              <th className="px-4 py-3 font-medium">Início</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-border">
            {rows.map(({ profile, habitsCount, longTerm, formation }) => (
              <tr key={profile.id} className={profile.is_demo ? "text-white/50" : "text-white"}>
                <td className="px-4 py-3">{profile.full_name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      profile.is_demo
                        ? "bg-base-surface2 text-white/40"
                        : "bg-accent-success/20 text-accent-success"
                    }`}
                  >
                    {profile.is_demo ? "Demonstração" : "Real"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {longTerm.fillPercent}% ({longTerm.perfectDays}/{longTerm.goalDurationDays} dias)
                </td>
                <td className="px-4 py-3">
                  {formation.goalReached ? "🔥 Sim" : `${formation.streakDays}/21`}
                </td>
                <td className="px-4 py-3">{habitsCount}</td>
                <td className="px-4 py-3">{profile.cycle_start_date ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-white/40">
                  Ninguém completou o onboarding ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
