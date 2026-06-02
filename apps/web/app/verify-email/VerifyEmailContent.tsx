"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

const inputCls =
  "w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 text-center tracking-widest text-base";

export default function VerifyEmailContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 flex items-center justify-center px-4">
        <p className="text-white/60 text-sm">No email provided. <Link href="/register" className="text-emerald-400 hover:underline">Go back to register</Link>.</p>
      </div>
    );
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: email as string, token: code, type: "email" });
    setLoading(false);
    if (error) { setError("Invalid or expired code."); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/assets/img/logo.png" alt="PetTrack" width={36} height={36} />
            <span className="text-lg font-semibold text-white">PetTrack</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 px-8 py-9 text-center">
          <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-1 text-sm text-gray-400">
            We sent a code to
          </p>
          <p className="text-sm font-semibold text-emerald-600 mt-0.5">{email}</p>

          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <input
              placeholder="8-digit code"
              inputMode="numeric"
              maxLength={8}
              className={inputCls}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Confirm and sign in"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
