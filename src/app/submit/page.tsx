import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { SubmitForm } from "@/components/anomaly/submit-form";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth/auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SubmitPage() {
  const session = await getServerSession(authOptions);

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
      {session ? (
        <SubmitForm />
      ) : (
        <div className="space-y-5">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Share a UX anomaly</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Found a confusing flow, broken interaction, weird copy, or surprising product behavior? Sign
              in to submit it and help others learn from real-world UX moments.
            </p>
          </header>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild>
              <Link href="/login?next=/submit">Log in to submit</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Back to feed</Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
