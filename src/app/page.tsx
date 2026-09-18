import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    redirect(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">
          Vire quem você <span className="text-brand">decidiu ser</span>.
        </h1>
        <p className="mx-auto max-w-xl text-white/60">
          Mapeie seu eu ideal, monte seu checklist diário e conquiste seus 21 dias — junto com
          uma comunidade que cresce com você.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/cadastro" className="btn-primary">
          Começar agora
        </Link>
        <Link href="/login" className="btn-secondary">
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
