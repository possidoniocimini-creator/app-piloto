"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    setCheckEmail(true);
    setLoading(false);
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold text-white">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-white/60">
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique nele e volte
            aqui pra entrar.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-white">Criar conta</h1>
          <p className="mt-1 text-sm text-white/50">Comece a mapear seu eu ideal.</p>
        </div>

        <div>
          <label className="label" htmlFor="fullName">
            Nome
          </label>
          <input
            id="fullName"
            type="text"
            required
            className="input-field"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="helper-text">Mínimo de 6 caracteres.</p>
        </div>

        {error && <p className="text-sm text-accent-danger">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-white/50">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand-light hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
