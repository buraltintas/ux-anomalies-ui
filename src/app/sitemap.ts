import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://uxanomalies.com";

  // TODO: Extend this with anomaly detail URLs from the dynamic backend-backed sitemap task.
  return [
    {
      url: `${appUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
