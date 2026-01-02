export default function AnimalsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-5 rounded-2xl border bg-white p-4 shadow-sm"
        >
          <div className="h-20 w-20 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="h-4 w-64 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-12 rounded bg-emerald-100" />
        </div>
      ))}
    </div>
  );
}
