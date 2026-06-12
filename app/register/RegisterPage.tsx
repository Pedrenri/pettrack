"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

const inputCls =
  "w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-emerald-300 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900";

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? "text-emerald-500 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}>
      <span className="text-base leading-none">{met ? "✓" : "·"}</span>
      {label}
    </div>
  );
}

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const reqs = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const passwordValid = Object.values(reqs).every(Boolean);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordValid) return;
    setErrorMsg("");
    setLoading(true);

    const { data } = await supabase.from("users").select("*").eq("email", email).single();
    if (data) {
      setErrorMsg("This email is already registered. Try another or sign in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: name } },
    });
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
            <Image src="/assets/img/icon.png" alt="ReptLog" width={36} height={36} />
            <span className="text-lg font-semibold text-white">ReptLog</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-black/30 px-8 py-9">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-gray-400">Free to get started</p>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Name <span className="text-red-400">*</span></label>
              <input
                placeholder="Your name"
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${inputCls} pr-11`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition text-sm select-none"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="mt-2.5 flex flex-col gap-1 pl-0.5">
                <PasswordRequirement met={reqs.length} label="At least 8 characters" />
                <PasswordRequirement met={reqs.letter} label="Contains a letter" />
                <PasswordRequirement met={reqs.number} label="Contains a number" />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 text-center">{errorMsg}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading || !passwordValid}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
