"use client";

import Link from "next/link";
import { Home, PlusSquare, UserRound } from "lucide-react";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/submit", label: "Submit", icon: PlusSquare },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function MobileNav({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const isFeedActive = pathname === "/" || pathname.startsWith("/anomalies");
  const isSubmitActive = pathname.startsWith("/submit");
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-3 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const href = item.href === "/profile" && !session ? "/login?next=/profile" : item.href;
          const active =
            (item.href === "/" && isFeedActive) ||
            (item.href === "/submit" && isSubmitActive) ||
            (item.href === "/profile" && isProfileActive);
          return (
            <li key={item.href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
