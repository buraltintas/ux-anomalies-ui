import { NextRequest, NextResponse } from "next/server";

import { getBackendUserContextFromRequest } from "@/lib/auth/server-auth";
import { backendFetch, backendFetchAsUser, isBackendError, sanitizeBackendError } from "@/server/backendClient";
import type { CommentListResponse, CommentResponse } from "@/lib/api/social-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  try {
    const data = await backendFetch<CommentListResponse>(`/v1/anomalies/${id}/comments`, {
      query: {
        cursor: searchParams.get("cursor") ?? undefined,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    if (isBackendError(error)) {
      console.error("[BFF comments list error]", sanitizeBackendError(error));
      return NextResponse.json({ message: "Failed to load comments" }, { status: error.status });
    }
    return NextResponse.json({ message: "Failed to load comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getBackendUserContextFromRequest(request);
  if (!context?.backendAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as { text?: string };

  if (!body.text?.trim()) {
    return NextResponse.json({ message: "Comment text is required" }, { status: 400 });
  }

  try {
    const data = await backendFetchAsUser<CommentResponse>(
      `/v1/anomalies/${id}/comments`,
      { Authorization: `Bearer ${context.backendAccessToken}` },
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body.text.trim() }),
      },
    );
    return NextResponse.json(data);
  } catch (error) {
    if (isBackendError(error)) {
      console.error("[BFF comments create error]", sanitizeBackendError(error));
      return NextResponse.json({ message: "Failed to create comment" }, { status: error.status });
    }
    return NextResponse.json({ message: "Failed to create comment" }, { status: 500 });
  }
}
