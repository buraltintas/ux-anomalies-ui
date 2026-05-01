import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WWW_HOST = "www.uxanomalies.com";
const APEX_URL = "https://uxanomalies.com";

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const host = request.headers.get("host");
  if (host !== WWW_HOST) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, APEX_URL);
  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
