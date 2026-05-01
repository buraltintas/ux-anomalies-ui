import "server-only";

import type {
  AppUserIdentity,
  BackendOAuthUpsertRequest,
  BackendOAuthUpsertResponse,
  OAuthProvider,
} from "@/lib/api/types";
import { backendFetch } from "@/server/backendClient";

const defaultSyncPath = "/v1/internal/auth/oauth-upsert";

function getOAuthSyncPath() {
  return process.env.BACKEND_OAUTH_SYNC_PATH || defaultSyncPath;
}

export interface OAuthSyncInput {
  provider: OAuthProvider;
  providerAccountId: string;
  email?: string | null;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
}

export interface OAuthSyncResult {
  user: AppUserIdentity;
  backendAccessToken?: string;
}

function toBackendRequest(input: OAuthSyncInput): BackendOAuthUpsertRequest {
  return {
    provider: input.provider,
    provider_user_id: input.providerAccountId,
    email: input.email,
    email_verified: input.emailVerified,
    name: input.name,
    avatar_url: input.image,
  };
}

function fromBackendResponse(response: BackendOAuthUpsertResponse): OAuthSyncResult {
  const backendAvatar =
    typeof response.user.avatar_url === "string" && response.user.avatar_url.trim().length > 0
      ? response.user.avatar_url
      : null;

  return {
    user: {
      appUserId: response.user.user_id,
      nickname: response.user.nickname ?? null,
      avatarUrl: backendAvatar,
      role: "user",
    },
    backendAccessToken: response.token,
  };
}

export async function syncOAuthUserWithBackend(input: OAuthSyncInput): Promise<OAuthSyncResult> {
  if (process.env.NODE_ENV !== "production") {
    console.info("[BFF oauth-upsert payload]", {
      provider: input.provider,
      hasProviderUserId: Boolean(input.providerAccountId),
      hasEmail: Boolean(input.email),
      hasName: Boolean(input.name),
      hasAvatarUrl: Boolean(input.image),
      emailVerified: input.emailVerified,
      verifiedEmailFieldName: "email_verified",
    });
  }

  const response = await backendFetch<BackendOAuthUpsertResponse>(getOAuthSyncPath(), {
    method: "POST",
    body: JSON.stringify(toBackendRequest(input)),
  });

  return fromBackendResponse(response);
}
