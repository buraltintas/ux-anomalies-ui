import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <h2 className="text-lg font-semibold">Anomaly not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">It may have been removed or the link is outdated.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
        Return to feed
      </Link>
    </div>
  );
}
