import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { getBackendUserContextFromRequest } from "@/lib/auth/server-auth";

export async function GET(request: NextRequest) {
  const context = await getBackendUserContextFromRequest(request);
  const session = await getServerSession(authOptions);

  if (!context || !session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({
      user: {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        nickname: session.user.nickname ?? null,
        avatarUrl: session.user.avatarUrl ?? null,
        image: session.user.image ?? null,
        provider: session.user.provider ?? null,
      },
    });
  }

  return NextResponse.json({
    user: {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      nickname: session.user.nickname ?? null,
      avatarUrl: session.user.avatarUrl ?? null,
      image: session.user.image ?? null,
      provider: session.user.provider ?? null,
    },
  });
}
