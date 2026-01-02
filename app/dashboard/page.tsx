import { Suspense } from "react";
import Link from "next/link";
import AnimalsList from "./AnimalsList";
import AnimalsSkeleton from "./AnimalsSkeleton";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center px-6 py-10">
      <div className="w-full max-w-4xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-emerald-800">
            Bem-vindo 👋
          </h1>
          <p className="text-gray-600 max-w-xl">
            Gerencie seus animais, acompanhe registros de saúde e mantenha tudo
            organizado em um só lugar.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Seus animais</h2>
            <Link
              href="/dashboard/animals/new"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold transition hover:bg-emerald-700 hover:shadow-md"
            >
              + Novo animal
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
