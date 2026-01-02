import { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm px-0 xl:px-120">
        <Link href="/" className="text-xl font-bold text-emerald-700">
          <Image src="/assets/img/logo.png" alt="Logo" width={40} height={40} className="inline-block mr-2" />
          PetTrack
        </Link>

        <LogoutButton />
      </header>

      <main className="p-2 md:p-8">{children}</main>
    </div>
  );
}
