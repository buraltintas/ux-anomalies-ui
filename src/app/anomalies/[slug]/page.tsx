import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";

import { AnomalyImageGallery } from "@/components/anomaly/anomaly-image-gallery";
import { AnomalyDetailInteractions } from "@/components/anomaly/anomaly-detail-interactions";
import { authOptions } from "@/lib/auth/auth";
import type { AnomalyDetailResponse } from "@/lib/api/types";
import {
  getCommentCount,
  getDetailPreviewImage,
  getLikeCount,
  getViewerHasLiked,
  hasViewerHasLiked,
} from "@/lib/utils/anomaly-image";
import { isBackendError } from "@/server/backendClient";

interface Props {
  params: Promise<{ slug: string }>;
}

function normalizeDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://uxanomalies.com")
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const appUrl = await getRequestOrigin();
  const requestHeaders = await headers();

  try {
    const response = await fetch(`${appUrl}/api/anomalies/by-slug/${slug}`, {
      headers: requestHeaders,
      cache: "no-store",
    });
    if (response.status === 404) {
      return {
        title: "Anomaly not found · UX Anomalies",
      };
    }
    if (!response.ok) {
      throw new Error("Failed to fetch anomaly");
    }
    const data = (await response.json()) as AnomalyDetailResponse;
    const anomaly = data.anomaly ?? data;

    return {
      title: anomaly.title ? `${anomaly.title} · UX Anomalies` : "UX Anomaly · UX Anomalies",
      description: anomaly.description ?? "A public UX anomaly report.",
    };
  } catch (error) {
    if (isBackendError(error) && error.status === 404) {
      return {
        title: "Anomaly not found · UX Anomalies",
      };
    }

    return {
      title: "UX Anomaly · UX Anomalies",
      description: "A public UX anomaly report.",
    };
  }
}

export default async function AnomalyDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  let data: AnomalyDetailResponse | null = null;
  const requestHeaders = await headers();
  const apiBaseUrl = await getRequestOrigin();
  let fetchError: string | null = null;

  try {
    const response = await fetch(`${apiBaseUrl}/api/anomalies/by-slug/${slug}`, {
      headers: requestHeaders,
      cache: "no-store",
    });
    if (response.status === 404) {
      notFound();
    }
    if (!response.ok) {
      fetchError = `Failed to fetch anomaly (${response.status})`;
      throw new Error(fetchError);
    }
    data = (await response.json()) as AnomalyDetailResponse;
  } catch (error) {
    if (isBackendError(error) && error.status === 404) {
      notFound();
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[detail page fetch error]", {
        slug,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return (
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-border/80 bg-card p-6">
        <h1 className="text-lg font-semibold">Could not load anomaly</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {fetchError ?? "Please try again in a moment."}
        </p>
      </section>
    );
  }

  const anomaly = data?.anomaly ?? data ?? null;
  if (!anomaly) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-border/80 bg-card p-6">
        <h1 className="text-lg font-semibold">Anomaly unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">This anomaly could not be loaded right now.</p>
      </section>
    );
  }
  const anomalyId = anomaly.id ?? "";
  const hasAnomalyId = anomalyId.length > 0;
  const createdAt = normalizeDate(anomaly.created_at ?? anomaly.createdAt);
  const sourceUrl = anomaly.source_url ?? anomaly.sourceUrl;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://uxanomalies.com";
  const shareUrl = `${appUrl}/anomalies/${slug}`;
  const showAuthor = Boolean(session);
  const authorLabel =
    anomaly.author?.display_name?.trim() ||
    anomaly.author?.displayName?.trim() ||
    anomaly.author?.nickname?.trim() ||
    "UX Anomalies user";
  const normalizedImages = (anomaly.images ?? []).filter((image) => Boolean(image?.url?.trim()));
  const previewImage = getDetailPreviewImage(anomaly);

  if (process.env.NODE_ENV !== "production") {
    console.info("[detail page diagnostics]", {
      slug,
      hasAnomaly: Boolean(anomaly),
      anomalyKeys: Object.keys(anomaly ?? {}),
      hasImages: Array.isArray(anomaly.images),
      imageCount: normalizedImages.length,
      hasFirstImageUrl: Boolean(normalizedImages[0]?.url || previewImage),
      hasAuthor: Boolean(anomaly.author),
      authorKeys: Object.keys(anomaly.author ?? {}),
      likeCount: getLikeCount(anomaly),
      commentCount: getCommentCount(anomaly),
      viewerHasLiked: anomaly.viewer_has_liked ?? anomaly.viewerHasLiked ?? null,
    });
  }

  return (
    <article className="mx-auto w-full max-w-3xl space-y-6">
      {hasAnomalyId ? (
        <AnomalyDetailInteractions
          anomalyId={anomalyId}
          slug={slug}
          title={anomaly.title || "UX anomaly"}
          shareUrl={shareUrl}
          initialLikeCount={getLikeCount(anomaly)}
          initialCommentCount={getCommentCount(anomaly)}
          initialViewerHasLiked={getViewerHasLiked(anomaly)}
          hasReliableViewerState={hasViewerHasLiked(anomaly)}
          isAuthenticated={Boolean(session)}
        >
          <header className="space-y-3">
            <p className="inline-flex rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium">
              {anomaly.category}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {anomaly.title || "Untitled anomaly"}
            </h1>
            {showAuthor ? (
              <p className="text-sm text-muted-foreground">
                Submitted by {authorLabel}
                {createdAt ? ` · ${createdAt.toLocaleDateString()}` : ""}
              </p>
            ) : createdAt ? (
              <p className="text-sm text-muted-foreground">{createdAt.toLocaleDateString()}</p>
            ) : null}
          </header>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card p-3">
            <AnomalyImageGallery
              images={normalizedImages.length ? normalizedImages : [{ url: previewImage }]}
              title={anomaly.title}
            />
          </div>

          <section className="rounded-2xl border border-border/80 bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {anomaly.description || "No description provided."}
            </p>
          </section>

          {sourceUrl ? (
            <section className="rounded-2xl border border-border/80 bg-card p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Source</h2>
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-primary hover:underline">
                {sourceUrl}
              </a>
            </section>
          ) : null}

          {!showAuthor ? (
            <p className="text-sm text-muted-foreground">
              <Link href={`/login?next=${encodeURIComponent(`/anomalies/${slug}`)}`} className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to see submitter details and join the discussion.
            </p>
          ) : null}
        </AnomalyDetailInteractions>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to feed
            </Link>
          </div>
          <header className="space-y-3">
            <p className="inline-flex rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium">
              {anomaly.category}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {anomaly.title || "Untitled anomaly"}
            </h1>
            {showAuthor ? (
              <p className="text-sm text-muted-foreground">
                Submitted by {authorLabel}
                {createdAt ? ` · ${createdAt.toLocaleDateString()}` : ""}
              </p>
            ) : createdAt ? (
              <p className="text-sm text-muted-foreground">{createdAt.toLocaleDateString()}</p>
            ) : null}
          </header>
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card p-3">
            <AnomalyImageGallery
              images={normalizedImages.length ? normalizedImages : [{ url: previewImage }]}
              title={anomaly.title}
            />
          </div>
          <section className="rounded-2xl border border-border/80 bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {anomaly.description || "No description provided."}
            </p>
          </section>
          {sourceUrl ? (
            <section className="rounded-2xl border border-border/80 bg-card p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Source</h2>
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-primary hover:underline">
                {sourceUrl}
              </a>
            </section>
          ) : null}
          {!showAuthor ? (
            <p className="text-sm text-muted-foreground">
              <Link href={`/login?next=${encodeURIComponent(`/anomalies/${slug}`)}`} className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to see submitter details and join the discussion.
            </p>
          ) : null}
          <section id="comments" className="rounded-2xl border border-dashed border-border bg-card p-6">
            <h2 className="text-base font-semibold">Comments</h2>
            <p className="mt-2 text-sm text-muted-foreground">Comments are unavailable for this anomaly.</p>
          </section>
        </>
      )}
    </article>
  );
}
