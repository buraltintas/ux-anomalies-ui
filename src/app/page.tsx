import type { Metadata } from "next";
import Link from "next/link";

import { FeedList } from "@/components/feed/feed-list";
import { Button } from "@/components/ui/button";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://uxanomalies.com";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const activeQuery = q.trim();

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "UX Anomalies",
    url: appUrl,
    description: "Social platform for spotting real-world UX anomalies.",
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Latest UX Anomalies</h1>
        {activeQuery ? (
          <div className="flex items-center gap-3 text-sm">
            <p className="text-muted-foreground">
              Results for <span className="font-medium text-foreground">“{activeQuery}”</span>
            </p>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2">
              <Link href="/">Clear search</Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            A curated stream of interaction edge-cases, dark patterns, and delightful fixes.
          </p>
        )}
      </header>
      <FeedList />
    </div>
  );
}
