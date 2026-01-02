import Link from "next/link";
import Image from "next/image";
import heroImage from "../public/assets/img/pets-hero.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/img/logo.png"
            alt="PetTrack"
            width={42}
            height={42}
          />
          <span className="text-2xl font-semibold text-emerald-700">
            PetTrack
          </span>
        </div>

        <Link
          href="/login"
          className="rounded-full border border-emerald-600 px-6 py-2 text-emerald-700 font-medium hover:bg-emerald-100 transition"
        >
          Entrar
        </Link>
      </header>

      {/* HERO */}
      <main className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">
              Tudo o que seu pet precisa,
              <span className="text-emerald-600"> organizado em um só lugar</span>
            </h1>

            <p className="mt-6 text-lg text-zinc-600 max-w-xl">
              Centralize vacinas, consultas, alimentação e lembretes importantes.
              Mais controle, menos preocupação.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-full bg-emerald-600 px-8 py-3 text-white font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                Começar gratuitamente
              </Link>

              <Link
                href="#features"
                className="rounded-full px-8 py-3 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
              >
                Ver recursos
              </Link>
            </div>
          </div>

          <div className="relative">
            <Image
              src={heroImage}
              alt="Pets felizes e saudáveis"
              className="rounded-3xl shadow-xl"
              priority
            />
          </div>
        </div>
      </main>

      {/* FEATURES */}
      <section
        id="features"
        className="bg-white py-24"
      >
        <div className="max-w-6xl mx-auto px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900">
              Feito para quem ama cuidar
            </h2>
            <p className="mt-4 text-zinc-600 max-w-2xl mx-auto">
              Funcionalidades essenciais para manter a saúde e a rotina do seu pet sempre em dia.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-emerald-700 mb-3">
                📅 Lembretes inteligentes
              </h3>
              <p className="text-zinc-600">
                Receba alertas para vacinas, medicamentos e consultas sem esforço.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-emerald-700 mb-3">
                🐾 Perfil completo do pet
              </h3>
              <p className="text-zinc-600">
                Histórico, informações importantes e registros organizados.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-emerald-700 mb-3">
                ❤️ Simples e confiável
              </h3>
              <p className="text-zinc-600">
                Interface limpa, rápida e pensada para uso diário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} PetTrack. Todos os direitos reservados.
      </footer>
    </div>
  );
}
