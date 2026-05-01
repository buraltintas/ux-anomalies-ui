import { NextRequest, NextResponse } from "next/server";

import { getBackendUserContextFromRequest } from "@/lib/auth/server-auth";
import type { AnomalyDetailResponse } from "@/lib/api/types";
import { backendFetch, backendFetchAsUser, isBackendError, sanitizeBackendError } from "@/server/backendClient";

export const dynamic = "force-dynamic";

function stripAuthorIdentity<T extends Record<string, unknown>>(payload: T): T {
  const cloned = structuredClone(payload) as Record<string, unknown>;
  const anomaly = ((cloned.anomaly as Record<string, unknown> | undefined) ?? cloned) as Record<string, unknown>;

  delete anomaly.author;
  delete anomaly.author_id;
  delete anomaly.authorId;
  delete anomaly.author_email;
  delete anomaly.authorEmail;
  delete anomaly.author_avatar_url;
  delete anomaly.authorAvatarUrl;
  delete anomaly.author_nickname;
  delete anomaly.authorNickname;

  if ("anomaly" in cloned) {
    cloned.anomaly = anomaly;
  }

  return cloned as T;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const userContext = await getBackendUserContextFromRequest(request);
    const isAuthenticated = Boolean(userContext?.appUserId);
    const hasBackendAccessToken = Boolean(userContext?.backendAccessToken);
    const data = hasBackendAccessToken
      ? await backendFetchAsUser<AnomalyDetailResponse>(
          `/v1/public/anomalies/${slug}`,
          { Authorization: `Bearer ${userContext?.backendAccessToken}` },
          { cache: "no-store" },
        )
      : await backendFetch<AnomalyDetailResponse>(`/v1/public/anomalies/${slug}`, { cache: "no-store" });
    const anomaly = data.anomaly ?? data;

    if (process.env.NODE_ENV !== "production") {
      const hasFirstImageUrl = Boolean(anomaly.images?.[0]?.url);
      const viewerHasLikedValue = anomaly.viewer_has_liked ?? anomaly.viewerHasLiked ?? null;
      const viewerHasLikedPresent =
        anomaly.viewer_has_liked !== undefined && anomaly.viewer_has_liked !== null
          ? true
          : anomaly.viewerHasLiked !== undefined && anomaly.viewerHasLiked !== null
            ? true
            : false;
      console.info("[detail route diagnostics]", {
        route: "detail",
        hasSession: isAuthenticated,
        hasBackendAccessToken,
        viewerHasLikedPresent,
        viewerHasLikedValue,
        likeCount: anomaly.like_count ?? anomaly.likeCount ?? 0,
        commentCount: anomaly.comment_count ?? anomaly.commentCount ?? 0,
        hasFirstImageUrl,
      });
    }

    return NextResponse.json(isAuthenticated ? data : stripAuthorIdentity(data as Record<string, unknown>));
  } catch (error) {
    if (isBackendError(error)) {
      console.error("[detail route fetch error]", sanitizeBackendError(error));
      return NextResponse.json({ message: "Failed to fetch anomaly" }, { status: error.status });
    }

    return NextResponse.json({ message: "Failed to fetch anomaly" }, { status: 500 });
  }
}
