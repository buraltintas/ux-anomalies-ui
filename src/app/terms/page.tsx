import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for UX Anomalies.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Terms of Use</h1>
        <p className="text-sm text-muted-foreground">Last updated: May 2, 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Introduction</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          UX Anomalies is a platform for sharing and discussing real-world UX moments. By using the platform,
          you agree to these terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">User-generated content</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Submissions, screenshots, comments, and related materials are user-generated content. UX Anomalies does
          not automatically review or endorse every submission.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">User responsibility</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          You are responsible for the content you submit. Please only upload content you have the right to share and
          avoid posting unlawful, confidential, private, or sensitive personal information.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Content moderation and removal</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          UX Anomalies may moderate, restrict, or remove content at its discretion to protect users, comply with law,
          and maintain platform quality.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Prohibited content</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Do not submit content that is unlawful, abusive, deceptive, infringing, or that exposes private data,
          credentials, financial details, health records, or confidential business information.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Intellectual property</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          You retain ownership of your content. By posting, you grant UX Anomalies permission to host and display it
          so the platform can operate.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Screenshots and third-party content</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          If you share screenshots or references to third-party interfaces, make sure you have the right to do so and
          avoid sharing material that violates others&apos; rights or confidentiality.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">No professional advice</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Content on UX Anomalies is for discussion and learning. It is not legal, security, compliance, or other
          professional advice.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Limitation of liability</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          UX Anomalies aims to provide a useful service, but availability and accuracy cannot be guaranteed at all
          times. To the extent allowed by law, liability is limited for platform use and user-submitted content.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Changes to terms</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          These terms may be updated over time. Continued use of the platform after updates means you accept the
          revised terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Contact</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          For complaints, takedown requests, or questions about these terms, contact: burak.altintas@yahoo.com.tr
        </p>
      </section>
    </article>
  );
}
