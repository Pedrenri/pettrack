import Link from "next/link";
import Image from "next/image";
import imageURL from "../public/assets/img/pets-hero.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-6">
        <h1 className="text-2xl font-bold text-emerald-700">
          <Image
            src="/assets/img/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="inline-block mr-2"
          />
          PetTrack
        </h1>
        <Link
          href="/login"
          className="rounded-full bg-emerald-600 px-6 py-2 text-white font-medium hover:bg-emerald-700 transition"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-bold text-zinc-800 max-w-2xl">
          Acompanhe a saúde e a rotina do seu pet em um só lugar
        </h2>

        <p className="mt-6 text-lg text-zinc-600 max-w-xl">
          Vacinas, consultas, alimentação e lembretes — tudo organizado para
          você cuidar melhor de quem te ama incondicionalmente.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-full bg-emerald-600 px-8 py-3 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Começar agora
          </Link>

          <Link
            href="#features"
            className="rounded-full border border-emerald-600 px-8 py-3 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
          >
            Saber mais
          </Link>
        </div>

        <div className="mt-16">
          <Image
            src={imageURL}
            alt="Pets felizes"
            width={500}
            height={300}
            priority
          />
        </div>
      </main>

      {/* Features */}
      <section
        id="features"
        className="bg-white py-20 px-8 grid gap-10 md:grid-cols-3 text-center"
      >
        <div>
          <h3 className="text-xl font-semibold text-emerald-700">
            📅 Lembretes inteligentes
          </h3>
          <p className="mt-3 text-zinc-600">
            Nunca mais esqueça vacinas, remédios ou consultas.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-700">
            🐶 Perfil do pet
          </h3>
          <p className="mt-3 text-zinc-600">
            Todas as informações importantes do seu pet em um só lugar.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-700">
            ❤️ Simples e intuitivo
          </h3>
          <p className="mt-3 text-zinc-600">
            Interface pensada para quem ama pets, não complicações.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} PetTrack
      </footer>
    </div>
  );
}
