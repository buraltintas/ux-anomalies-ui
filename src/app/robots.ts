import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://uxanomalies.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/register", "/profile", "/submit"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
