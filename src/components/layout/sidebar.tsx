"use client";

import Link from "next/link";
import * as Avatar from "@radix-ui/react-avatar";
import { Home, LogIn, PlusSquare, UserRound } from "lucide-react";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";

import { LogoLockup } from "@/components/brand/logo-lockup";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { getUserAvatarSrc, getUserDisplayName, getUserInitials } from "@/lib/utils/user-display";
import { ExploreSearch } from "@/components/layout/explore-search";

const items = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/submit", label: "Submit", icon: PlusSquare },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function Sidebar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const avatarSrc = session ? getUserAvatarSrc(session.user) : undefined;
  const displayName = session ? getUserDisplayName(session.user) : "";
  const initials = session ? getUserInitials(session.user) : "";

  const isFeedActive = pathname === "/" || pathname.startsWith("/anomalies");
  const isSubmitActive = pathname.startsWith("/submit");
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/70 bg-card/40 p-6 lg:flex lg:flex-col">
      <Link href="/" className="mb-8 inline-flex">
        <LogoLockup markSize={30} textClassName="text-xl" />
      </Link>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            (item.href === "/" && isFeedActive) ||
            (item.href === "/submit" && isSubmitActive) ||
            (item.href === "/profile" && isProfileActive);
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={`w-full justify-start ${active ? "bg-primary/10 text-primary" : "text-foreground"}`}
            >
              <Link href={item.href} aria-current={active ? "page" : undefined}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3">
        <ExploreSearch />
        {session ? (
          <div className="rounded-xl border border-border/80 bg-background/70 p-2">
            <div className="flex items-center gap-2 px-1 py-1.5">
              <Avatar.Root>
                <Avatar.Image
                  src={avatarSrc}
                  alt={`${displayName} profile photo`}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <Avatar.Fallback className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-medium">
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{session.user.email ?? "Signed in"}</p>
              </div>
            </div>
            <div className="px-1 pb-1">
              <UserMenu session={session} triggerVariant="button" />
            </div>
          </div>
        ) : (
          <Button asChild className="w-full">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Login / Sign up
            </Link>
          </Button>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
          <Link href="/about" className="hover:text-foreground hover:underline">
            About
          </Link>
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </aside>
  );
}
