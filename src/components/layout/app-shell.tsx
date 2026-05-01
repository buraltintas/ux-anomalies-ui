import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

interface Props {
  children: React.ReactNode;
}

export async function AppShell({ children }: Props) {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1280px] bg-background text-foreground">
      <Sidebar session={session} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar session={session} />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pt-6">{children}</main>
      </div>
      <MobileNav session={session} />
    </div>
  );
}
