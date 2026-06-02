"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";
import { ThemeToggle } from "@/app/components/ThemeProvider";

const tabs = [
  { label: "Animals", href: "/dashboard", icon: "🦎" },
  { label: "Schedules", href: "/dashboard/schedules", icon: "📅" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── DESKTOP top nav ── */}
      <header className="hidden md:flex items-center justify-between px-8 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold">
            <Image src="/assets/img/logo.png" alt="Logo" width={28} height={28} />
            <span>PetTrack</span>
          </Link>

          {/* Tab pills */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive(tab.href)
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" />
          <LogoutButton />
        </div>
      </header>

      {/* ── MOBILE bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg">
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-semibold transition-colors relative ${
                  active
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-emerald-500" />
                )}
                <span className="text-xl leading-none">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}

          {/* Account — tab style */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <LogoutButton tabMode />
          </div>
        </div>
      </nav>
    </>
  );
}
