import type { MetadataRoute } from "next";

import type { PublicSitemapEntry } from "@/lib/api/types";

export const revalidate = 3600;

interface BackendSitemapPage {
  items?: PublicSitemapEntry[];
  next_cursor?: string | null;
}

function getLastModified(entry: PublicSitemapEntry) {
  const value = entry.updated_at ?? entry.updatedAt ?? entry.created_at ?? entry.createdAt;
  if (!value) return new Date();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function fetchAllPublicAnomaliesForSitemap() {
  const all: PublicSitemapEntry[] = [];
  let cursor: string | undefined;
  const baseUrl = process.env.BACKEND_API_BASE_URL;
  const bffSecret = process.env.BFF_SECRET;

  if (!baseUrl || !bffSecret) {
    throw new Error("Missing BACKEND_API_BASE_URL or BFF_SECRET");
  }

  while (true) {
    const url = new URL("/v1/public/anomalies/sitemap", baseUrl);
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const response = await fetch(url, {
      headers: {
        "X-BFF-Secret": bffSecret,
      },
      next: { revalidate },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Sitemap backend request failed (${response.status}): ${body || "No body"}`);
    }

    const page = (await response.json()) as BackendSitemapPage | PublicSitemapEntry[];

    const items = Array.isArray(page) ? page : page.items ?? [];
    all.push(...items);

    if (Array.isArray(page) || !page.next_cursor) {
      break;
    }

    cursor = page.next_cursor;
  }

  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = getAppUrl();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${appUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${appUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${appUrl}/terms`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${appUrl}/privacy`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const entries = await fetchAllPublicAnomaliesForSitemap();

    const anomalyPages: MetadataRoute.Sitemap = entries
      .filter((entry) => Boolean(entry.slug))
      .map((entry) => ({
        url: `${appUrl}/anomalies/${entry.slug}`,
        lastModified: getLastModified(entry),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    if (process.env.NODE_ENV !== "production") {
      console.info("[sitemap dynamic entries]", {
        staticCount: staticPages.length,
        anomalyCount: anomalyPages.length,
      });
    }

    return [...staticPages, ...anomalyPages];
  } catch (error) {
    console.warn("[sitemap backend fetch failed]", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return staticPages;
  }
}
