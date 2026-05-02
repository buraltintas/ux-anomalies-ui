import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Why UX Anomalies exists.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const orgStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "UX Anomalies",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    email: "burak.altintas@yahoo.com.tr",
  };

  return (
    <article className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgStructuredData) }}
      />
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">About UX Anomalies</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          UX Anomalies is a place to collect real-world interface oddities: tiny frictions, confusing interactions,
          dark patterns, delightful fixes, and edge cases that reveal how products actually behave.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Why this exists</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Small details often reveal the biggest product decisions. A strange button state, unclear copy, or odd flow
          can say a lot about tradeoffs, constraints, and user impact.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">How to contribute</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Submit examples with context: what happened, why it felt confusing or surprising, and what might make it
          better. The goal is practical learning, not noise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Learning over shaming</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          UX Anomalies is not about shaming teams or brands. It is about learning from real interfaces and improving
          product thinking together.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Contact</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          UX Anomalies is built by Burak Altıntaş. You can reach me at{" "}
          <a
            href="mailto:burak.altintas@yahoo.com.tr"
            className="text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            burak.altintas@yahoo.com.tr
          </a>{" "}
          or visit{" "}
          <a
            href="https://burak-altintas.com"
            target="_blank"
            rel="noreferrer"
            className="inline-block whitespace-nowrap text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            burak-altintas.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
