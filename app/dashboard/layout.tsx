import { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/ThemeProvider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-gray-950 flex flex-col">
      {/* Top nav — desktop only */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold">
          <Image src="/assets/img/logo.png" alt="Logo" width={28} height={28} />
          <span>PetTrack</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" />
          <LogoutButton />
        </div>
      </header>

      {/* Mobile bottom nav */}
      <header className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-sm">
          <Image src="/assets/img/logo.png" alt="Logo" width={24} height={24} />
          PetTrack
        </Link>
        <LogoutButton />
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
