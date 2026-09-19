"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/dashboard", label: "Checklist" },
  { href: "/diario", label: "Diário" },
  { href: "/ranking", label: "Ranking" },
  { href: "/aulas", label: "Aulas" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (pathname === "/login" || pathname === "/cadastro" || pathname === "/") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-base-border bg-base-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <span className="text-lg font-semibold text-white">
          Mentoria<span className="text-accent-gold">.</span>
        </span>
        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith(link.href)
                  ? "bg-brand/20 text-brand-light"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 rounded-lg px-3 py-2 text-sm text-white/40 transition hover:text-accent-danger"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
