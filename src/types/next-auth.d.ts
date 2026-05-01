import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      appUserId?: string | null;
      nickname?: string | null;
      avatarUrl?: string | null;
      provider?: "google" | "github";
      role?: string | null;
      authSyncError?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: "google" | "github";
    appUserId?: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
    authSyncError?: string | null;
    backendAccessToken?: string;
  }
}
