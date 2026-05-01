"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { AnomalyComments } from "@/components/anomaly/anomaly-comments";
import { AnomalyLikeButton } from "@/components/anomaly/anomaly-like-button";
import { ShareAnomalyButton } from "@/components/anomaly/share-anomaly-button";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  anomalyId: string;
  slug: string;
  title: string;
  shareUrl: string;
  initialLikeCount: number;
  initialCommentCount: number;
  initialViewerHasLiked?: boolean;
  hasReliableViewerState: boolean;
  isAuthenticated: boolean;
  children: ReactNode;
}

export function AnomalyDetailInteractions({
  anomalyId,
  slug,
  title,
  shareUrl,
  initialLikeCount,
  initialCommentCount,
  initialViewerHasLiked,
  hasReliableViewerState,
  isAuthenticated,
  children,
}: Props) {
  const qc = useQueryClient();
  const [commentCount, setCommentCount] = useState(
    Number.isFinite(initialCommentCount) ? initialCommentCount : 0,
  );

  const commentLabel = useMemo(
    () => (commentCount > 0 ? `View comments (${commentCount})` : "View comments"),
    [commentCount],
  );

  const handleCommentCreated = () => {
    setCommentCount((prev) => Math.max(0, prev + 1));
    qc.invalidateQueries({ queryKey: ["feed-infinite"] }).catch(() => undefined);
    qc.invalidateQueries({ queryKey: ["feed"] }).catch(() => undefined);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back to feed
        </Link>
        <div className="flex items-center gap-2">
          <AnomalyLikeButton
            anomalyId={anomalyId}
            slug={slug}
            initialCount={initialLikeCount}
            initialLiked={initialViewerHasLiked}
            hasReliableViewerState={hasReliableViewerState}
            isAuthenticated={isAuthenticated}
          />
          <Tooltip label="View comments">
            <Button asChild variant="ghost" size="sm" aria-label={commentLabel}>
              <Link href={`/anomalies/${slug}#comments`}>
                <MessageSquare className="h-4 w-4" />
                {commentCount > 0 ? ` ${commentCount}` : null}
              </Link>
            </Button>
          </Tooltip>
          <Tooltip label="Share">
            <ShareAnomalyButton title={title} text={title} url={shareUrl} />
          </Tooltip>
        </div>
      </div>

      {children}

      <AnomalyComments
        anomalyId={anomalyId}
        slug={slug}
        isAuthenticated={isAuthenticated}
        onCommentCreated={handleCommentCreated}
      />
    </>
  );
}
