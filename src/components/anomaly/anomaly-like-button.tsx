"use client";

import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { likeAnomaly, unlikeAnomaly } from "@/lib/api/client";
import type { Anomaly, AnomalyDetailResponse, FeedResponse } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface Props {
  anomalyId: string;
  slug?: string;
  initialCount: number;
  initialLiked?: boolean;
  isAuthenticated: boolean;
  hasReliableViewerState?: boolean;
}

export function AnomalyLikeButton({
  anomalyId,
  slug,
  initialCount,
  initialLiked = false,
  isAuthenticated,
  hasReliableViewerState = false,
}: Props) {
  const [isReliable, setIsReliable] = useState(hasReliableViewerState);
  const [liked, setLiked] = useState(hasReliableViewerState ? Boolean(initialLiked) : false);
  const [count, setCount] = useState(Number.isFinite(initialCount) ? initialCount : 0);
  const qc = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const applyLikeStateToAnomaly = (
    anomaly: Anomaly,
    nextLiked: boolean,
    nextCount: number,
  ): Anomaly => ({
    ...anomaly,
    like_count: nextCount,
    likeCount: nextCount,
    viewer_has_liked: nextLiked,
    viewerHasLiked: nextLiked,
  });

  const syncLikeStateInCache = (nextLiked: boolean, nextCount: number) => {
    let updatedFeedCache = false;
    let updatedDetailCache = false;

    qc.setQueriesData({ queryKey: ["feed-infinite"] }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== "object" || !("pages" in (oldData as Record<string, unknown>))) {
        return oldData;
      }

      const data = oldData as { pages: FeedResponse[]; pageParams?: unknown[] };
      const nextPages = data.pages.map((page) => {
        let changedInPage = false;
        const nextItems = page.items.map((item) => {
          if (item.id !== anomalyId) {
            return item;
          }
          changedInPage = true;
          return applyLikeStateToAnomaly(item, nextLiked, nextCount);
        });

        if (!changedInPage) {
          return page;
        }

        updatedFeedCache = true;
        return {
          ...page,
          items: nextItems,
        };
      });

      return {
        ...data,
        pages: nextPages,
      };
    });

    qc.setQueriesData({ queryKey: ["feed"] }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== "object" || !("items" in (oldData as Record<string, unknown>))) {
        return oldData;
      }
      const data = oldData as FeedResponse;
      let changed = false;
      const nextItems = data.items.map((item) => {
        if (item.id !== anomalyId) {
          return item;
        }
        changed = true;
        return applyLikeStateToAnomaly(item, nextLiked, nextCount);
      });

      if (!changed) {
        return oldData;
      }
      updatedFeedCache = true;
      return {
        ...data,
        items: nextItems,
      };
    });

    qc.setQueriesData({ queryKey: ["anomaly-detail"] }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== "object") {
        return oldData;
      }

      const data = oldData as AnomalyDetailResponse;
      const anomaly = (data.anomaly ?? data) as Partial<Anomaly>;
      const targetById = anomaly.id === anomalyId;
      const targetBySlug = Boolean(slug && anomaly.slug === slug);
      if (!targetById && !targetBySlug) {
        return oldData;
      }

      const nextAnomaly = applyLikeStateToAnomaly(anomaly as Anomaly, nextLiked, nextCount);
      updatedDetailCache = true;

      if ("anomaly" in data && data.anomaly) {
        return {
          ...data,
          anomaly: nextAnomaly,
        };
      }

      return {
        ...data,
        ...nextAnomaly,
      };
    });

    if (process.env.NODE_ENV !== "production") {
      console.info("[like-cache-sync]", {
        event: "like-cache-sync",
        anomalyId,
        slug: slug ?? null,
        nextCount,
        nextLiked,
        updatedFeedCache,
        updatedDetailCache,
      });
    }
  };

  const mutation = useMutation({
    mutationFn: async (nextLiked: boolean) => (nextLiked ? likeAnomaly(anomalyId) : unlikeAnomaly(anomalyId)),
    onMutate: (nextLiked) => {
      const previousLiked = liked;
      const previousCount = count;

      if (!isReliable) {
        return { previousLiked, previousCount, didOptimisticUpdate: false };
      }

      setLiked(nextLiked);
      setCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      const optimisticCount = nextLiked ? previousCount + 1 : Math.max(0, previousCount - 1);
      syncLikeStateInCache(nextLiked, optimisticCount);
      return { previousLiked, previousCount, didOptimisticUpdate: true };
    },
    onError: (_error, nextLiked, context) => {
      if (context?.didOptimisticUpdate) {
        setLiked(context.previousLiked);
        setCount(context.previousCount);
        syncLikeStateInCache(context.previousLiked, context.previousCount);
      }
      toast.error("Could not update like right now.");
    },
    onSuccess: (data, nextLiked, context) => {
      const returnedCount = data.like_count ?? data.likeCount;
      const returnedLiked = data.viewer_has_liked ?? data.viewerHasLiked;
      const resolvedLiked = typeof returnedLiked === "boolean" ? returnedLiked : nextLiked;
      const baseCount = context?.didOptimisticUpdate
        ? nextLiked
          ? context.previousCount + 1
          : Math.max(0, context.previousCount - 1)
        : count;
      const resolvedCount =
        typeof returnedCount === "number" ? Math.max(0, returnedCount) : Math.max(0, baseCount);

      setCount(resolvedCount);
      setLiked(resolvedLiked);
      syncLikeStateInCache(resolvedLiked, resolvedCount);

      const shouldRefetch =
        !isReliable || typeof returnedCount !== "number" || typeof returnedLiked !== "boolean";
      if (typeof returnedLiked === "boolean") {
        setIsReliable(true);
      }

      qc.invalidateQueries({ queryKey: ["feed-infinite"] }).catch(() => undefined);
      qc.invalidateQueries({ queryKey: ["feed"] }).catch(() => undefined);
      qc.invalidateQueries({ queryKey: ["anomaly-detail"] }).catch(() => undefined);

      if (shouldRefetch) {
        router.refresh();
      }
    },
  });

  const onToggle = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    // TODO: Persistent liked state requires backend viewer_has_liked.
    if (!isReliable) {
      if (liked) return;
      mutation.mutate(true);
      return;
    }

    const nextLiked = !liked;
    mutation.mutate(nextLiked);
  };

  const tooltipLabel = isReliable && liked ? "Unlike" : "Like";
  const ariaLabel = isReliable && liked ? "Unlike anomaly" : "Like anomaly";

  return (
    <Tooltip label={tooltipLabel}>
      <Button
        variant="ghost"
        size="sm"
        aria-label={ariaLabel}
        onClick={onToggle}
        className={isReliable && liked ? "text-primary" : undefined}
      >
        <Heart className="h-4 w-4" /> {count}
      </Button>
    </Tooltip>
  );
}
