import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { syncOAuthUserWithBackend } from "@/lib/api/auth-server";
import type { OAuthProvider } from "@/lib/api/types";

function isSupportedOAuthProvider(provider?: string): provider is OAuthProvider {
  return provider === "google" || provider === "github";
}

function readBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
}

function getVerifiedEmailFromProfile(provider: OAuthProvider, profile: unknown): boolean | undefined {
  if (!profile || typeof profile !== "object") {
    return undefined;
  }

  const raw = profile as Record<string, unknown>;

  if (provider === "google") {
    // Google exposes email_verified directly in OAuth profile payload.
    return raw.email_verified === true;
  }

  // GitHub basic OAuth profile often omits reliable email verification state.
  // TODO: If backend keeps requiring verified GitHub email, add server-side
  // GitHub emails API lookup in a secure flow and pass verified result.
  return readBoolean(raw.verified_email ?? raw.email_verified ?? raw.emailVerified);
}

interface ResolvedOAuthIdentity {
  email?: string | null;
  emailVerified: boolean;
}

type ProviderImageSource = "profile.picture" | "profile.avatar_url" | "user.image" | null;

interface GitHubEmailRecord {
  email: string;
  primary: boolean;
  verified: boolean;
}

async function resolveGitHubPrimaryVerifiedEmail(accessToken?: string | null) {
  if (!accessToken) {
    return null;
  }

  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const emails = (await response.json()) as GitHubEmailRecord[];
  return emails.find((entry) => entry.primary && entry.verified) ?? null;
}

async function resolveOAuthIdentityForSync(params: {
  provider: OAuthProvider;
  profile: unknown;
  providerAccessToken?: string | null;
  fallbackEmail?: string | null;
}) {
  if (params.provider === "google") {
    const verified = getVerifiedEmailFromProfile("google", params.profile) === true;
    return {
      email: params.fallbackEmail,
      emailVerified: verified,
    } satisfies ResolvedOAuthIdentity;
  }

  const verifiedFromProfile = getVerifiedEmailFromProfile("github", params.profile);
  if (verifiedFromProfile === true && params.fallbackEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[GitHub oauth verification]", {
        provider: "github",
        hasAccessToken: Boolean(params.providerAccessToken),
        foundPrimaryVerifiedEmail: false,
        emailVerified: true,
      });
    }
    return {
      email: params.fallbackEmail,
      emailVerified: true,
    } satisfies ResolvedOAuthIdentity;
  }

  const verifiedPrimary = await resolveGitHubPrimaryVerifiedEmail(params.providerAccessToken);
  const foundPrimaryVerifiedEmail = Boolean(verifiedPrimary?.email);

  if (process.env.NODE_ENV !== "production") {
    console.info("[GitHub oauth verification]", {
      provider: "github",
      hasAccessToken: Boolean(params.providerAccessToken),
      foundPrimaryVerifiedEmail,
      emailVerified: foundPrimaryVerifiedEmail,
    });
  }

  return {
    email: verifiedPrimary?.email ?? params.fallbackEmail,
    emailVerified: foundPrimaryVerifiedEmail,
  } satisfies ResolvedOAuthIdentity;
}

function getProviderImage(params: { provider: OAuthProvider; profile: unknown; userImage?: string | null }) {
  let source: ProviderImageSource = null;
  let url: string | null = null;

  if (params.profile && typeof params.profile === "object") {
    const raw = params.profile as Record<string, unknown>;
    if (params.provider === "google" && typeof raw.picture === "string" && raw.picture.trim().length > 0) {
      source = "profile.picture";
      url = raw.picture;
    }
    if (params.provider === "github" && typeof raw.avatar_url === "string" && raw.avatar_url.trim().length > 0) {
      source = "profile.avatar_url";
      url = raw.avatar_url;
    }
  }

  if (!url && params.userImage && params.userImage.trim().length > 0) {
    source = "user.image";
    url = params.userImage;
  }

  return { url, source };
}

function normalizeAvatarUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getProfileKeys(profile: unknown): string[] {
  if (!profile || typeof profile !== "object") return [];
  return Object.keys(profile as Record<string, unknown>);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !isSupportedOAuthProvider(account.provider)) {
        return false;
      }

      if (!account.providerAccountId) {
        return "/login?error=ProviderAccountMissing";
      }

      try {
        if (process.env.NODE_ENV !== "production") {
          const raw = (profile && typeof profile === "object" ? (profile as Record<string, unknown>) : null) ?? {};
          if (account.provider === "google") {
            console.info("[OAuth signIn avatar trace]", {
              provider: "google",
              hasProfilePicture: typeof raw.picture === "string" && raw.picture.trim().length > 0,
              hasUserImage: Boolean(user.image && user.image.trim().length > 0),
              profileKeys: getProfileKeys(profile),
              finalTokenAvatarUrlSet: false,
            });
          } else {
            console.info("[OAuth signIn avatar trace]", {
              provider: "github",
              hasProfileAvatarUrl: typeof raw.avatar_url === "string" && raw.avatar_url.trim().length > 0,
              hasUserImage: Boolean(user.image && user.image.trim().length > 0),
              profileKeys: getProfileKeys(profile),
              finalTokenAvatarUrlSet: false,
            });
          }
        }

        const resolvedIdentity = await resolveOAuthIdentityForSync({
          provider: account.provider,
          profile,
          providerAccessToken: account.access_token,
          fallbackEmail: user.email,
        });
        const providerImage = getProviderImage({
          provider: account.provider,
          profile,
          userImage: user.image,
        });

        await syncOAuthUserWithBackend({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email: resolvedIdentity.email,
          emailVerified: resolvedIdentity.emailVerified,
          name: user.name,
          image: providerImage.url,
        });

        return true;
      } catch {
        return account.provider === "github"
          ? "/login?error=GitHubVerifiedEmailRequired"
          : "/login?error=BackendSyncFailed";
      }
    },

    async jwt({ token, account, user, profile }) {
      if (account && isSupportedOAuthProvider(account.provider)) {
        try {
          const resolvedIdentity = await resolveOAuthIdentityForSync({
            provider: account.provider,
            profile,
            providerAccessToken: account.access_token,
            fallbackEmail: user.email,
          });
          const providerImage = getProviderImage({
            provider: account.provider,
            profile,
            userImage: user.image,
          });

          const backendIdentity = await syncOAuthUserWithBackend({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            email: resolvedIdentity.email,
            emailVerified: resolvedIdentity.emailVerified,
            name: user.name,
            image: providerImage.url,
          });

          const finalAvatarUrl =
            normalizeAvatarUrl(backendIdentity.user.avatarUrl) ??
            normalizeAvatarUrl(providerImage.url) ??
            normalizeAvatarUrl(typeof token.avatarUrl === "string" ? token.avatarUrl : null) ??
            null;
          const finalImage =
            normalizeAvatarUrl(finalAvatarUrl) ??
            normalizeAvatarUrl(typeof token.image === "string" ? token.image : null) ??
            null;

          if (process.env.NODE_ENV !== "production") {
            const raw = (profile && typeof profile === "object" ? (profile as Record<string, unknown>) : null) ?? {};
            if (account.provider === "google") {
              console.info("[OAuth jwt avatar trace]", {
                provider: "google",
                hasProfilePicture: typeof raw.picture === "string" && raw.picture.trim().length > 0,
                hasUserImage: Boolean(user.image && user.image.trim().length > 0),
                profileKeys: getProfileKeys(profile),
                finalTokenAvatarUrlSet: Boolean(finalAvatarUrl),
              });
            } else {
              console.info("[OAuth jwt avatar trace]", {
                provider: "github",
                hasProfileAvatarUrl: typeof raw.avatar_url === "string" && raw.avatar_url.trim().length > 0,
                hasUserImage: Boolean(user.image && user.image.trim().length > 0),
                profileKeys: getProfileKeys(profile),
                finalTokenAvatarUrlSet: Boolean(finalAvatarUrl),
              });
            }
          }

          token.provider = account.provider;
          token.appUserId = backendIdentity.user.appUserId;
          token.nickname = backendIdentity.user.nickname ?? null;
          token.avatarUrl = finalAvatarUrl;
          token.image = finalImage;
          token.role = backendIdentity.user.role ?? "user";
          token.backendAccessToken = backendIdentity.backendAccessToken;
          token.authSyncError = null;
        } catch {
          token.authSyncError = "BackendSyncFailed";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          id: "",
        };
      }

      session.user.id = token.sub ?? "";
      session.user.appUserId = token.appUserId ?? null;
      session.user.nickname = token.nickname ?? null;
      session.user.avatarUrl =
        normalizeAvatarUrl(typeof token.avatarUrl === "string" ? token.avatarUrl : null) ??
        normalizeAvatarUrl(typeof token.image === "string" ? token.image : null) ??
        null;
      session.user.image = session.user.avatarUrl;
      session.user.provider = token.provider;
      session.user.role = token.role ?? "user";
      session.user.authSyncError = token.authSyncError ?? null;

      if (process.env.NODE_ENV !== "production" && (token.provider === "google" || token.provider === "github")) {
        if (token.provider === "google") {
          console.info("[OAuth session avatar trace]", {
            provider: "google",
            hasProfilePicture: false,
            hasUserImage: Boolean(session.user.image && session.user.image.trim().length > 0),
            profileKeys: [],
            finalTokenAvatarUrlSet: Boolean(token.avatarUrl),
          });
        } else {
          console.info("[OAuth session avatar trace]", {
            provider: "github",
            hasProfileAvatarUrl: false,
            hasUserImage: Boolean(session.user.image && session.user.image.trim().length > 0),
            profileKeys: [],
            finalTokenAvatarUrlSet: Boolean(token.avatarUrl),
          });
        }
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
