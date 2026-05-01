import "server-only";

import type {
  AnomalyDetailResponse,
  FeedQuery,
  FeedResponse,
  PublicSitemapEntry,
} from "@/lib/api/types";
import { buildBackendUserHeaders, type BackendUserContext } from "@/lib/auth/server-auth";
import { backendFetch, backendFetchAsUser } from "@/server/backendClient";

export function getFeed(params: FeedQuery) {
  return backendFetch<FeedResponse>("/v1/feed", { query: { ...params } });
}

export function getAnomalyBySlug(slug: string) {
  return backendFetch<AnomalyDetailResponse>(`/v1/public/anomalies/${slug}`);
}

export function getPublicAnomalySitemap() {
  return backendFetch<PublicSitemapEntry[]>("/v1/public/anomalies/sitemap");
}

// Reusable helper for protected backend calls through BFF.
export function backendProtectedRequest<T>(
  userContext: BackendUserContext,
  path: string,
  init?: RequestInit,
) {
  return backendFetchAsUser<T>(path, buildBackendUserHeaders(userContext), init);
}
