import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "UX Anomalies",
    template: "%s | UX Anomalies",
  },
  description: "Social platform for spotting real-world UX anomalies.",
  applicationName: "UX Anomalies",
  authors: [{ name: "UX Anomalies" }],
  creator: "UX Anomalies",
  publisher: "UX Anomalies",
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon" }],
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
  openGraph: {
    type: "website",
    siteName: "UX Anomalies",
    url: appUrl,
    title: "UX Anomalies",
    description: "Social platform for spotting real-world UX anomalies.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "UX Anomalies",
    description: "Social platform for spotting real-world UX anomalies.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
