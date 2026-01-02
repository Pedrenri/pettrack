"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function VerifyEmailContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <p className="text-gray-600">
          Email não informado. Volte ao cadastro.
        </p>
      </div>
    );
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      email: email as string,
      token: code,
      type: "email",
    });

    if (error) {
      setError("Código inválido ou expirado.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-2xl font-bold text-emerald-700 text-center">
          🐾 PetTrack
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Digite o código enviado para
        </p>

        <p className="text-center font-medium text-emerald-700">
          {email}
        </p>

        <input
          placeholder="Código de 8 dígitos"
          inputMode="numeric"
          maxLength={8}
          className="mt-6 w-full text-center tracking-widest text-lg rounded-lg border px-4 py-3"
          onChange={e => setCode(e.target.value)}
          required
        />

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <button className="mt-6 w-full rounded-full bg-emerald-600 py-3 text-white">
          Confirmar e entrar
        </button>
      </form>
    </div>
  );
}
