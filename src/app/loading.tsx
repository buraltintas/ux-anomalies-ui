export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="aspect-[16/10] animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
