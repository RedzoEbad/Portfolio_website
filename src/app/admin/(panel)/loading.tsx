export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-hull-2" />
      <div className="mt-3 h-4 w-80 animate-pulse rounded bg-hull-2" />
      <div className="mt-8 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-hull-2" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    </div>
  );
}
