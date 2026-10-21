export default function SiteLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-40 animate-pulse rounded bg-hull-2" />
      <div className="mt-8 h-16 w-full max-w-2xl animate-pulse rounded-xl bg-hull-2" />
      <div className="mt-4 h-6 w-full max-w-xl animate-pulse rounded bg-hull-2" />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-hull-2" />
        <div className="h-64 animate-pulse rounded-2xl bg-hull-2" />
      </div>
    </div>
  );
}
