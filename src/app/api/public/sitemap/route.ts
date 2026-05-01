import { NextResponse } from "next/server";

import { getPublicAnomalySitemap } from "@/lib/api/server";

export async function GET() {
  try {
    const data = await getPublicAnomalySitemap();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch sitemap",
      },
      { status: 500 },
    );
  }
}
