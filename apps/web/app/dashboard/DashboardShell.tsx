"use client";

import Link from "next/link";
import { motion } from "motion/react";

const floaters = ["🦎", "🐍", "🐊", "🐢", "🦕"];

export default function DashboardShell({
  children,
  count,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-gray-950">

      {/* ── HERO HEADER ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white"
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Glow blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-12">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PetTrack
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl md:text-4xl font-bold tracking-tight"
              >
                Your collection
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm text-white/50"
              >
                {count !== undefined
                  ? `${count} animal${count !== 1 ? "s" : ""} tracked`
                  : "Track feeding, shedding and health records"}
              </motion.p>
            </div>

            {/* Floating emojis */}
            <div className="flex gap-0.5 mt-1 opacity-30 select-none">
              {floaters.map((emoji, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                  className="text-xl md:text-2xl"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Add button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <Link
              href="/dashboard/animals/new"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-emerald-900/30"
            >
              <span className="text-base leading-none">+</span>
              Add Animal
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── CONTENT ── */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
