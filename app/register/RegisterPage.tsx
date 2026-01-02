"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: name },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      {success ? (
        <p className="mt-6 text-center text-sm text-emerald-600">
          Enviamos um email de confirmação para <strong>{email}</strong>.<br />
          Confirme sua conta para continuar.
        </p>
      ) : (
        <>
          <form
            onSubmit={handleRegister}
            className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
          >
            <h1 className="text-2xl font-bold text-emerald-700 text-center">
              🐾 PetTrack
            </h1>

            <p className="text-center text-gray-600 mt-2">Crie sua conta</p>

            <div className="mt-6 space-y-4">
              <input
                placeholder="Seu nome"
                className="w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Senha"
                className="w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <p className="mt-4 text-sm text-red-500 text-center">
                {errorMsg}
              </p>
            )}

            <button
              className="mt-6 w-full rounded-full bg-emerald-600 py-3 text-white font-semibold transition hover:bg-emerald-700 hover:shadow-md hover:cursor-pointer"
              type="submit"
            >
              Criar conta
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:underline"
              >
                Entrar
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
}
