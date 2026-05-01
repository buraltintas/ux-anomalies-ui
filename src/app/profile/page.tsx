import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import * as Avatar from "@radix-ui/react-avatar";

import { authOptions } from "@/lib/auth/auth";
import { getProviderLabel, getUserAvatarSrc, getUserDisplayName, getUserInitials } from "@/lib/utils/user-display";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?next=/profile");
  }

  if (!session.user.appUserId || session.user.authSyncError) {
    redirect("/login?error=BackendSyncFailed&next=/profile");
  }

  const displayName = getUserDisplayName(session.user);
  const avatarSrc = getUserAvatarSrc(session.user);
  const initials = getUserInitials(session.user);
  const providerLabel = getProviderLabel(session.user.provider);

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar.Root>
          <Avatar.Image
            src={avatarSrc}
            alt={`${displayName} profile photo`}
            className="h-20 w-20 rounded-full object-cover"
          />
          <Avatar.Fallback className="grid h-20 w-20 place-items-center rounded-full bg-muted text-xl font-semibold">
            {initials}
          </Avatar.Fallback>
        </Avatar.Root>

        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signed in</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{displayName}</h1>
          <p className="truncate text-sm text-muted-foreground">{session.user.email ?? "No email available"}</p>
          <p className="text-sm text-muted-foreground">Your UX Anomalies profile</p>
          {providerLabel ? (
            <span className="inline-flex rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium">
              {providerLabel}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
