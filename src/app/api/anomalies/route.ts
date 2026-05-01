import { NextRequest, NextResponse } from "next/server";

import { getBackendUserContextFromRequest } from "@/lib/auth/server-auth";

function requiredEnv(name: "BACKEND_API_BASE_URL" | "BFF_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const context = await getBackendUserContextFromRequest(request);

    if (!context?.backendAccessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const backendUrl = new URL("/v1/anomalies", requiredEnv("BACKEND_API_BASE_URL"));

    const upstream = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "X-BFF-Secret": requiredEnv("BFF_SECRET"),
        Authorization: `Bearer ${context.backendAccessToken}`,
      },
      body: formData,
      cache: "no-store",
    });

    const body = (await upstream.json().catch(() => ({}))) as {
      message?: string;
      error?: { message?: string };
      slug?: string;
    };

    if (!upstream.ok) {
      const detail = body.error?.message ?? body.message ?? "Backend request failed";
      return NextResponse.json({ message: "Backend request failed", detail }, { status: upstream.status });
    }

    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ message: "Backend request failed" }, { status: 500 });
  }
}
