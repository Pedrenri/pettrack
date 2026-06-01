"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: "🦎",
    title: "Species Profiles",
    body: "Detailed records for geckos, chameleons, monitors, snakes and more — built around how reptiles actually live.",
  },
  {
    icon: "🌡️",
    title: "Care Tracking",
    body: "Log feeding, shedding, handling and weigh-ins. Never lose track of your animal's care history.",
  },
  {
    icon: "🔲",
    title: "QR Identity Tags",
    body: "Generate a scannable QR code for each animal. Perfect for enclosure labels or physical ID tags.",
  },
];

const floaters = ["🐍", "🦎", "🐊", "🦕", "🐢"];

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingContent({ heroImage }: { heroImage: any }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white">
        {/* Glow blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative flex items-center justify-between px-5 py-5 max-w-6xl mx-auto w-full md:px-10"
        >
          <div className="flex items-center gap-2.5">
            <Image src="/assets/img/logo.png" alt="PetTrack" width={30} height={30} />
            <span className="font-semibold text-white">PetTrack</span>
          </div>
          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition backdrop-blur-sm"
          >
            Sign in
          </Link>
        </motion.nav>

        {/* Hero content */}
        <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-10 pb-20 md:pt-16 md:pb-28 grid md:grid-cols-2 gap-12 items-center">

          {/* Text */}
          <div className="order-2 md:order-1 space-y-6">
            <FadeUp delay={0.05}>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Built for exotic keepers
              </div>
            </FadeUp>

            <FadeUp delay={0.14}>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                Your reptiles,{" "}
                <span className="text-emerald-400">perfectly tracked</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.22}>
              <p className="text-base md:text-lg text-white/60 max-w-lg">
                The all-in-one care tracker for geckos, snakes, monitors, chameleons, and every exotic species you keep.
              </p>
            </FadeUp>

            <FadeUp delay={0.30}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-semibold text-white text-center shadow-lg shadow-emerald-900/40 transition"
                >
                  Get Started — it's free
                </Link>
                <Link
                  href="#features"
                  className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 text-center hover:bg-white/10 transition"
                >
                  See features ↓
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.38}>
              <div className="flex gap-2.5 opacity-30 select-none">
                {floaters.map((emoji, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.8 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    className="text-xl"
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: 16 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 md:order-2"
          >
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl" />
            <Image
              src={heroImage}
              alt="Reptiles and exotic pets"
              className="relative rounded-2xl md:rounded-3xl shadow-2xl shadow-black/40"
              priority
            />
          </motion.div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-14"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Built for reptile enthusiasts
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-500 max-w-xl mx-auto">
              Every feature designed around the unique care needs of exotic herps.
            </p>
          </motion.div>

          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm cursor-default"
              >
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} PetTrack. All rights reserved.
      </footer>
    </div>
  );
}
