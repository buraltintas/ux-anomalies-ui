import type { FeedQuery } from "@/lib/api/types";

export const queryKeys = {
  feed: (params: FeedQuery) => ["feed", params] as const,
  feedInfinite: (params: Omit<FeedQuery, "cursor">) => ["feed-infinite", params] as const,
  anomalyDetail: (slug: string) => ["anomaly-detail", slug] as const,
  anomalyComments: (id: string) => ["anomaly-comments", id] as const,
  me: () => ["me"] as const,
};
