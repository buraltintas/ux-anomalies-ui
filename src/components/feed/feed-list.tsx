"use client";

import Link from "next/link";
import { MessageSquare, Share2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import type { Anomaly, FeedResponse } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/queryKeys";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useMemo } from "react";
import {
  getCommentCount,
  getFeedPreviewImage,
  getImageCount,
  getLikeCount,
  getViewerHasLiked,
  hasViewerHasLiked,
} from "@/lib/utils/anomaly-image";
import { SafeImage } from "@/components/anomaly/safe-image";
import { AnomalyLikeButton } from "@/components/anomaly/anomaly-like-button";

async function fetchFeed(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch feed");
  }
  return (await res.json()) as FeedResponse;
}

function FeedPreviewImage({ item }: { item: Anomaly }) {
  const imageUrl = useMemo(() => getFeedPreviewImage(item), [item]);
  const imageCount = getImageCount(item);
  const extraImages = imageCount > 1 ? imageCount - 1 : 0;

  return (
    <>
      <SafeImage
        src={imageUrl}
        alt={item.title || "Anomaly preview"}
        className="h-full w-full object-cover"
        fallbackClassName="grid h-full place-items-center text-sm text-muted-foreground"
        fallbackText="No preview image"
      />
      {extraImages > 0 ? (
        <span className="absolute right-2 top-2 rounded-full bg-foreground/85 px-2 py-0.5 text-xs font-medium text-background">
          +{extraImages}
        </span>
      ) : null}
    </>
  );
}

export function FeedList() {
  const searchParams = useSearchParams();
  const { status } = useSession();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const queryBase = new URLSearchParams();
  if (q) queryBase.set("q", q);
  if (category) queryBase.set("category", category);

  const { data, error, isLoading } = useInfiniteQuery({
    queryKey: queryKeys.feedInfinite({ q, category, limit: 10 }),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams(queryBase.toString());
      params.set("limit", "10");
      if (pageParam) {
        params.set("cursor", pageParam as string);
      }
      return fetchFeed(`/api/feed?${params.toString()}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? null,
  });
  // TODO: Hook up fetchNextPage (infinite scroll button/intersection) to consume additional cursor pages.

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  const isShareCancel = (error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("abort") || message.includes("cancel")) {
        return true;
      }
    }

    return false;
  };

  const handleShare = async (item: Anomaly) => {
    const shareUrl = `${window.location.origin}/anomalies/${item.slug}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied.");
    } catch (error) {
      if (isShareCancel(error)) {
        return;
      }
      toast.error("Could not share this anomaly right now.");
    }
  };

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        We could not load the feed right now. Please retry in a moment.
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">No anomalies yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Try a different search or be the first to submit one.</p>
        <Button asChild className="mt-4">
          <Link href="/submit">Submit anomaly</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const commentCount = getCommentCount(item);
        const commentLabel = commentCount > 0 ? `View comments (${commentCount})` : "View comments";

        return (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-border/80 bg-card">
            <Link href={`/anomalies/${item.slug}`} className="block">
              <div className="relative aspect-[16/10] bg-muted">
                <FeedPreviewImage item={item} />
              </div>
            </Link>
            <div className="space-y-3 p-4">
              <div>
                <Link href={`/anomalies/${item.slug}`} className="text-base font-semibold leading-tight hover:underline">
                  {item.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.id ? (
                  <AnomalyLikeButton
                    anomalyId={item.id}
                    slug={item.slug}
                    initialCount={getLikeCount(item)}
                    initialLiked={getViewerHasLiked(item)}
                    hasReliableViewerState={hasViewerHasLiked(item)}
                    isAuthenticated={status === "authenticated"}
                  />
                ) : null}
                <Tooltip label="View comments">
                  <Button asChild variant="ghost" size="sm" aria-label={commentLabel}>
                    <Link href={`/anomalies/${item.slug}#comments`}>
                      <MessageSquare className="h-4 w-4" />
                      {commentCount > 0 ? ` ${commentCount}` : null}
                    </Link>
                  </Button>
                </Tooltip>
                <Tooltip label="Share">
                  <Button variant="ghost" size="sm" aria-label="Share anomaly" onClick={() => handleShare(item)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="aspect-[16/10] animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
