import { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import Image from "next/image";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">

      {/* HEADER */}
      <header
        
        className="
          fixed bottom-0 left-0 right-0
          bg-white border-t
          flex items-center justify-between
          px-6 py-3
          shadow-lg
          
          md:relative md:bottom-auto md:border-0
          md:shadow-sm md:px-8 md:py-4
          xl:px-120
        "
      >
        <Link
          href="/"
          className="flex items-center text-emerald-700 font-semibold md:text-xl"
        >
          <Image
            src="/assets/img/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="mr-2 md:w-10 md:h-10"
          />
          <span className="hidden md:inline">PetTrack</span>
        </Link>

        <LogoutButton />
      </header>

      {/* MAIN */}
      <main className="flex-1 p-2 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}