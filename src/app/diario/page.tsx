import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalForm } from "@/components/JournalForm";

export default async function DiarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("went_well, went_wrong, difficulty")
    .eq("user_id", user.id)
    .eq("entry_date", today)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Diário de hoje</h1>
        <p className="text-white/60">
          Um espaço só seu pra anotar o que aconteceu — o próprio ato de escrever já ajuda a
          perceber o que errou, o que acertou e onde travou.
        </p>
      </div>

      <JournalForm
        initial={{
          wentWell: entry?.went_well ?? "",
          wentWrong: entry?.went_wrong ?? "",
          difficulty: entry?.difficulty ?? "",
        }}
      />
    </div>
  );
}
