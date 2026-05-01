import Link from "next/link";
import { Plus } from "lucide-react";
import type { Session } from "next-auth";

import { LogoLockup } from "@/components/brand/logo-lockup";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export function TopBar({ session }: { session: Session | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center gap-3 px-4 md:px-6">
        <Link href="/" className="inline-flex lg:hidden">
          <LogoLockup markSize={24} textClassName="text-base" />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/submit">
              <Plus className="h-4 w-4" />
              Submit
            </Link>
          </Button>
          {session ? (
            <UserMenu session={session} />
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
