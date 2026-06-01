import { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col">
      {/* Top nav — desktop only */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 text-gray-800 font-semibold">
          <Image src="/assets/img/logo.png" alt="Logo" width={28} height={28} />
          <span>PetTrack</span>
        </Link>
        <LogoutButton />
      </header>

      {/* Mobile bottom nav */}
      <header className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex items-center justify-between px-6 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
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
