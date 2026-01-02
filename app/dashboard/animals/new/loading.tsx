export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center px-6 py-10">
      <div className="w-full max-w-4xl space-y-10 animate-pulse">
        {/* Header */}
        <header className="space-y-2">
          <div className="h-8 w-48 rounded bg-emerald-100" />
          <div className="h-4 w-96 rounded bg-gray-200" />
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-gray-200" />
            <div className="h-10 w-32 rounded-full bg-emerald-200" />
          </div>

          {/* Lista fake */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-5 rounded-2xl border bg-white p-4 shadow-sm"
              >
                {/* Foto */}
                <div className="h-20 w-20 rounded-xl bg-gray-200" />

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-40 rounded bg-gray-200" />
                  <div className="h-4 w-60 rounded bg-gray-100" />
                </div>

                {/* CTA */}
                <div className="h-4 w-12 rounded bg-emerald-100" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
