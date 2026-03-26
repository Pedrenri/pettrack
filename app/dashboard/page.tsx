import { Suspense } from "react";
import Link from "next/link";
import AnimalsList from "./AnimalsList";
import AnimalsSkeleton from "./AnimalsSkeleton";

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 md:flex md:justify-center md:px-6 md:py-10">
      <div className="w-full md:max-w-4xl md:space-y-10">
        {/* HEADER */}
        <header
          className="
          relative overflow-hidden
          bg-gradient-to-br from-emerald-600 to-emerald-400
          text-white
          px-5 py-6
          md:rounded-2xl md:p-8 md:shadow-lg
        "
        >
          <div className="relative  space-y-1">
            <h1 className="text-xl md:text-3xl font-semibold">Bem-vindo 👋</h1>

            <p className="text-sm md:text-base max-w-xl text-emerald-50/90">
              Gerencie seus animais, acompanhe registros de saúde e mantenha
              tudo organizado em um só lugar.
            </p>
          </div>

          <div className="absolute right-4 top-4 opacity-20 text-6xl md:right-6 md:top-6 md:text-8xl">
            🐾
          </div>
        </header>

        {/* LISTA */}
        <section
          className="
          space-y-4
          px-4 py-5
          md:px-0 md:py-0 md:space-y-6
        "
        >
          <div
            className="
            flex items-center justify-between
            md:rounded-xl md:bg-white md:p-5 md:shadow-sm
          "
          >
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Seus animais
              </h2>

              <p className="text-xs md:text-sm text-gray-500">
                Lista completa dos animais cadastrados
              </p>
            </div>

            <Link
              href="/dashboard/animals/new"
              className="
                inline-flex items-center gap-2
                rounded-full
                bg-emerald-600
                px-4 py-2
                text-white text-sm font-semibold
                transition
                hover:bg-emerald-700
                md:px-5 md:py-2.5 md:hover:shadow-md
              "
            >
              <span className="text-lg">＋</span>
              <span className="hidden sm:inline">Novo animal</span>
            </Link>
          </div>

          <Suspense fallback={<AnimalsSkeleton />}>
            <AnimalsList />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
