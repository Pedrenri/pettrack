import { Suspense } from "react";
import Link from "next/link";
import AnimalsList from "./AnimalsList";
import AnimalsSkeleton from "./AnimalsSkeleton";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center px-6 py-10">
      <div className="w-full max-w-4xl space-y-10">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-8 text-white shadow-lg">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-semibold">Bem-vindo 👋</h1>
            <p className="max-w-xl text-emerald-50/90">
              Gerencie seus animais, acompanhe registros de saúde e mantenha
              tudo organizado em um só lugar.
            </p>
          </div>

          <div className="absolute right-6 top-6 opacity-15 text-8xl">🐾</div>
        </header>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Total de animais</p>
            <p className="text-3xl font-semibold text-gray-900">12</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Registros recentes</p>
            <p className="text-3xl font-semibold text-gray-900">3</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Seus animais
              </h2>
              <p className="text-sm text-gray-500">
                Lista completa dos animais cadastrados
              </p>
            </div>

            <Link
              href="/dashboard/animals/new"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold transition hover:bg-emerald-700 hover:shadow-md"
            >
              <span className="text-lg">＋</span>
              Novo animal
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
