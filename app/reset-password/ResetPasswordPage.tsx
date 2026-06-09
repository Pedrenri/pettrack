"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";

const inputCls =
  "w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:border-emerald-300 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });

    if (verifyError) {
      setLoading(false);
      setErrorMsg("Invalid or expired code. Please request a new one.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setErrorMsg(updateError.message);
      return;
    }

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
            <Image src="/assets/img/icon.png" alt="ReptLog" width={36} height={36} />
            <span className="text-lg font-semibold text-white">ReptLog</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-black/30 px-8 py-9">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-gray-400">
            Enter the code we sent to <span className="text-gray-600 dark:text-gray-300">{email}</span> and choose a new password.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                Reset code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="123456"
                className={inputCls}
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                required
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                New password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                Confirm password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputCls}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 text-center">{errorMsg}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60 mt-2"
            >
              {loading ? "Updating…" : "Set new password"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Didn&apos;t receive the code?{" "}
            <Link href="/forgot-password" className="font-semibold text-emerald-600 hover:underline">
              Try again
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
