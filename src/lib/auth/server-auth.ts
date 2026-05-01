import "server-only";

import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

import { authOptions } from "@/lib/auth/auth";

export interface BackendUserContext {
  appUserId: string;
  backendAccessToken?: string;
}

export async function getBackendUserContextFromRequest(
  request: NextRequest,
): Promise<BackendUserContext | null> {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token?.appUserId) {
    return null;
  }

  return {
    appUserId: token.appUserId,
    backendAccessToken: token.backendAccessToken,
  };
}

export async function getBackendUserIdentityFromSession(): Promise<Pick<BackendUserContext, "appUserId"> | null> {
  const session = await getServerSession(authOptions);
  const appUserId = session?.user?.appUserId;

  if (!appUserId) {
    return null;
  }

  return { appUserId };
}

export function buildBackendUserHeaders(context: BackendUserContext) {
  const headers: Record<string, string> = {
    "X-App-User-Id": context.appUserId,
  };

  if (context.backendAccessToken) {
    headers.Authorization = `Bearer ${context.backendAccessToken}`;
  }

  return headers;
}
