import { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
        <Link href="/dashboard" className="text-xl font-bold text-emerald-700">
          🐾 PetTrack
        </Link>

        <LogoutButton />
      </header>

      <main className="p-8">{children}</main>
    </div>
  );
}
