import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for UX Anomalies.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: May 2, 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Introduction</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          This policy explains how UX Anomalies handles information when you use the platform.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Information we collect</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We collect information needed to operate the service, including account details, user submissions, and
          interaction data such as likes and comments.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Account information</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          When you sign in with OAuth, providers may share profile fields such as your name, email, and avatar,
          depending on provider permissions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">User submissions</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Anomaly submissions may include title, category, description, source URL, and screenshots. Public
          submissions can be visible to other users and visitors.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Images and screenshots</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Uploaded screenshots may contain visible interface content. Please do not upload private, sensitive, or
          confidential information.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Comments and likes</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Comments and engagement signals such as likes may be associated with your account and visible as part of
          public discussions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Authentication providers</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Sign-in is processed through third-party providers (such as Google and GitHub). Their platforms govern how
          they process your data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Cookies and sessions</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We use secure session cookies to keep you signed in and protect account access.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Server logs and analytics</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We may use privacy-conscious analytics and hosting logs to understand performance, reliability, and abuse
          prevention.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">How information is used</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Information is used to operate the service, support moderation, improve product quality, and keep accounts
          secure.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Sharing and disclosure</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We may share information when required by law, to protect the platform, or to work with service providers
          that help run UX Anomalies.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Content removal requests</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          If you believe content should be removed, contact us with details and supporting context.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Data retention</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We retain data for as long as needed to operate the service, comply with obligations, and resolve disputes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Security</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We apply reasonable technical and organizational safeguards, but no system can guarantee absolute security.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Contact</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Questions or privacy requests: burak.altintas@yahoo.com.tr
        </p>
      </section>
    </article>
  );
}
