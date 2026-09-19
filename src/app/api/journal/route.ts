import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const wentWell = typeof body?.wentWell === "string" ? body.wentWell.trim() : "";
  const wentWrong = typeof body?.wentWrong === "string" ? body.wentWrong.trim() : "";
  const difficulty = typeof body?.difficulty === "string" ? body.difficulty.trim() : "";

  if (!wentWell && !wentWrong && !difficulty) {
    return NextResponse.json({ error: "Escreva pelo menos um dos campos." }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { error: upsertError } = await supabase.from("journal_entries").upsert(
    {
      user_id: user.id,
      entry_date: today,
      went_well: wentWell,
      went_wrong: wentWrong,
      difficulty,
    },
    { onConflict: "user_id,entry_date" }
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
