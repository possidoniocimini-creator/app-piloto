import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QaChat } from "@/components/QaChat";

export default async function DuvidasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: messages } = await supabase
    .from("mentor_qa_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <QaChat
      initialMessages={(messages ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))}
    />
  );
}
