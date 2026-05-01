import { NextRequest, NextResponse } from "next/server";

import { getBackendUserContextFromRequest } from "@/lib/auth/server-auth";
import type { FeedQuery, FeedResponse } from "@/lib/api/types";
import { backendFetch, backendFetchAsUser, isBackendError, sanitizeBackendError } from "@/server/backendClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userContext = await getBackendUserContextFromRequest(request);
    const hasSession = Boolean(userContext?.appUserId);
    const hasBackendAccessToken = Boolean(userContext?.backendAccessToken);
    const query: FeedQuery = {
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      author_nickname: searchParams.get("author_nickname") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
    };

    const backendQuery = query as Record<string, string | number | undefined | null>;

    const data = hasBackendAccessToken
      ? await backendFetchAsUser<FeedResponse>(
          "/v1/feed",
          { Authorization: `Bearer ${userContext?.backendAccessToken}` },
          { query: backendQuery },
        )
      : await backendFetch<FeedResponse>("/v1/feed", { query: backendQuery });

    if (process.env.NODE_ENV !== "production") {
      const first = data.items?.[0];
      const viewerHasLikedValue = first?.viewer_has_liked ?? first?.viewerHasLiked ?? null;
      const viewerHasLikedPresent =
        first?.viewer_has_liked !== undefined && first?.viewer_has_liked !== null
          ? true
          : first?.viewerHasLiked !== undefined && first?.viewerHasLiked !== null
            ? true
            : false;
      const hasThumbnailUrl = Boolean(first?.thumbnail_url || first?.thumbnailUrl);
      console.info("[feed route diagnostics]", {
        route: "feed",
        hasSession,
        hasBackendAccessToken,
        viewerHasLikedPresent,
        viewerHasLikedValue,
        hasThumbnailUrl,
        likeCount: first?.like_count ?? first?.likeCount ?? first?.likes_count ?? 0,
        commentCount: first?.comment_count ?? first?.commentCount ?? first?.comments_count ?? 0,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    const isDev = process.env.NODE_ENV !== "production";

    if (isBackendError(error)) {
      console.error("[BFF feed error]", sanitizeBackendError(error));
      if (isDev) {
        return NextResponse.json(
          {
            message: "Backend request failed",
            status: error.status,
            path: error.path,
            detail: error.backendMessage ?? "No backend detail",
          },
          { status: 500 },
        );
      }
    } else {
      console.error("[BFF feed error]", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return NextResponse.json({ message: "Backend request failed" }, { status: 500 });
  }
}
