import type { Metadata } from "next";

import { LogoLockup } from "@/components/brand/logo-lockup";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

const authErrorMap: Record<string, string> = {
  BackendSyncFailed: "Sign-in succeeded with provider, but we could not sync your account with UX Anomalies backend.",
  ProviderAccountMissing: "The OAuth provider did not return an account identifier.",
  GitHubVerifiedEmailRequired:
    "GitHub sign-in requires a primary verified email address on your GitHub account.",
  AccessDenied: "Access denied during authentication.",
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? authErrorMap[error] ?? "Authentication failed. Please try again." : null;

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
      <header className="mb-6 space-y-3 text-center">
        <div className="flex justify-center">
          <LogoLockup markSize={28} textClassName="text-xl" />
        </div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to like, comment, and submit anomalies.</p>
      </header>
      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
          {errorMessage}
        </div>
      ) : null}
      <OAuthButtons />
      <p className="mt-5 text-center text-xs text-muted-foreground">
        By continuing, you agree to upcoming terms and privacy policies.
      </p>
    </div>
  );
}
