import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LeaderboardRow = {
  user_id: string;
  full_name: string;
  completed_last_30_days: number;
  current_streak_days: number;
};

export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leaderboard, error } = await supabase.rpc("get_leaderboard");

  const rows = ((leaderboard ?? []) as LeaderboardRow[]).filter(
    (r) => r.completed_last_30_days > 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ranking da comunidade</h1>
        <p className="text-white/50">Quem mais executou o checklist nos últimos 30 dias.</p>
      </div>

      {error && (
        <p className="text-sm text-accent-danger">
          Não foi possível carregar o ranking agora. Tente novamente mais tarde.
        </p>
      )}

      {!error && rows.length === 0 && (
        <div className="card text-center text-white/50">
          Ainda não há check-ins suficientes pra montar o ranking. Seja o primeiro a aparecer
          aqui!
        </div>
      )}

      {rows.length > 0 && (
        <div className="card divide-y divide-base-border p-0">
          {rows.map((row, index) => (
            <div
              key={row.user_id}
              className={`flex items-center gap-4 px-5 py-4 ${
                row.user_id === user.id ? "bg-brand/10" : ""
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  index === 0
                    ? "bg-accent-gold text-black"
                    : index === 1
                      ? "bg-white/30 text-black"
                      : index === 2
                        ? "bg-amber-700 text-white"
                        : "bg-base-surface2 text-white/50"
                }`}
              >
                {index + 1}
              </span>
              <span className="flex-1 font-medium text-white">
                {row.full_name}
                {row.user_id === user.id && <span className="ml-2 text-xs text-brand-light">(você)</span>}
              </span>
              <span className="text-sm text-white/50">{row.completed_last_30_days} check-ins</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
