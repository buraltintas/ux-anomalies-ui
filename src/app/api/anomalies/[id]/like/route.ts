import { NextRequest, NextResponse } from "next/server";

import { getBackendUserContextFromRequest } from "@/lib/auth/server-auth";
import { backendFetchAsUser, isBackendError, sanitizeBackendError } from "@/server/backendClient";
import type { LikeResponse } from "@/lib/api/social-types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getBackendUserContextFromRequest(request);
  if (!context?.backendAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await backendFetchAsUser<LikeResponse>(
      `/v1/anomalies/${id}/like`,
      { Authorization: `Bearer ${context.backendAccessToken}` },
      { method: "POST" },
    );
    return NextResponse.json(data);
  } catch (error) {
    if (isBackendError(error)) {
      console.error("[BFF like error]", sanitizeBackendError(error));
      return NextResponse.json({ message: "Failed to like anomaly" }, { status: error.status });
    }
    return NextResponse.json({ message: "Failed to like anomaly" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getBackendUserContextFromRequest(request);
  if (!context?.backendAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await backendFetchAsUser<LikeResponse>(
      `/v1/anomalies/${id}/like`,
      { Authorization: `Bearer ${context.backendAccessToken}` },
      { method: "DELETE" },
    );
    return NextResponse.json(data);
  } catch (error) {
    if (isBackendError(error)) {
      console.error("[BFF unlike error]", sanitizeBackendError(error));
      return NextResponse.json({ message: "Failed to unlike anomaly" }, { status: error.status });
    }
    return NextResponse.json({ message: "Failed to unlike anomaly" }, { status: 500 });
  }
}
