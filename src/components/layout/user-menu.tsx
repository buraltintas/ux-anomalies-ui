"use client";

import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronUp, LogOut, UserRound } from "lucide-react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { getUserAvatarSrc, getUserDisplayName, getUserInitials } from "@/lib/utils/user-display";

export function UserMenu({
  session,
  triggerVariant = "avatar",
}: {
  session: Session;
  triggerVariant?: "avatar" | "button";
}) {
  const avatarSrc = getUserAvatarSrc(session.user);
  const displayName = getUserDisplayName(session.user);
  const initials = getUserInitials(session.user);

  return (
    <DropdownMenu.Root>
      {triggerVariant === "button" ? (
        <DropdownMenu.Trigger
          className="inline-flex h-9 w-full items-center justify-between rounded-lg border border-border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={`Open user menu for ${displayName}`}
        >
          Account
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        </DropdownMenu.Trigger>
      ) : (
        <DropdownMenu.Trigger
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={`Open user menu for ${displayName}`}
        >
          <Avatar.Root>
            <Avatar.Image
              src={avatarSrc}
              alt={`${displayName} profile photo`}
              className="h-9 w-9 rounded-full object-cover"
            />
            <Avatar.Fallback className="grid h-9 w-9 place-items-center rounded-full bg-muted text-xs font-medium">
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>
        </DropdownMenu.Trigger>
      )}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-52 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted"
            >
              <UserRound className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted"
            onSelect={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
