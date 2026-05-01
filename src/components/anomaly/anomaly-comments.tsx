"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as Avatar from "@radix-ui/react-avatar";

import { createComment, listComments } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/queryKeys";
import type { CommentListResponse } from "@/lib/api/social-types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  anomalyId: string;
  slug: string;
  isAuthenticated: boolean;
  onCommentCreated?: () => void;
}

function looksLikeEmail(value?: string | null) {
  if (!value) return false;
  return /\S+@\S+\.\S+/.test(value.trim());
}

function getCommentAuthorName(nickname?: string | null) {
  const trimmed = nickname?.trim();
  if (!trimmed || looksLikeEmail(trimmed)) {
    return "UX Anomalies user";
  }
  return trimmed;
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "UX").toUpperCase();
}

export function AnomalyComments({ anomalyId, slug, isAuthenticated, onCommentCreated }: Props) {
  const [text, setText] = useState("");
  const qc = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: queryKeys.anomalyComments(anomalyId),
    queryFn: () => listComments(anomalyId, undefined, 50),
  });

  const createMutation = useMutation({
    mutationFn: (nextText: string) => createComment(anomalyId, nextText),
    onSuccess: (newComment) => {
      qc.setQueryData<CommentListResponse>(queryKeys.anomalyComments(anomalyId), (prev) => ({
        items: [newComment, ...(prev?.items ?? [])],
        next_cursor: prev?.next_cursor ?? null,
      }));
      setText("");
      onCommentCreated?.();
      qc.invalidateQueries({ queryKey: queryKeys.anomalyComments(anomalyId) }).catch(() => undefined);
      qc.invalidateQueries({ queryKey: ["anomaly-detail"] }).catch(() => undefined);
      qc.invalidateQueries({ queryKey: ["feed-infinite"] }).catch(() => undefined);
      qc.invalidateQueries({ queryKey: ["feed"] }).catch(() => undefined);
      toast.success("Comment posted.");
    },
    onError: () => {
      toast.error("Could not post comment.");
    },
  });

  return (
    <section id="comments" className="rounded-2xl border border-dashed border-border bg-card p-6">
      <h2 className="text-base font-semibold">Comments</h2>

      {isAuthenticated ? (
        <form
          className="mt-3 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!text.trim()) return;
            createMutation.mutate(text.trim());
          }}
        >
          <label htmlFor="comment-text" className="sr-only">
            Write a comment
          </label>
          <textarea
            id="comment-text"
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/60 focus:ring-2"
            placeholder="Add your perspective"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={createMutation.isPending || !text.trim()}>
            Post comment
          </Button>
        </form>
      ) : (
        <div className="mt-3 text-sm text-muted-foreground">
          <Link href={`/login?next=${encodeURIComponent(`/anomalies/${slug}#comments`)}`} className="text-primary hover:underline">
            Sign in to comment
          </Link>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {commentsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading comments...</p> : null}
        {commentsQuery.isError ? (
          <p className="text-sm text-muted-foreground">Could not load comments right now.</p>
        ) : null}
        {!commentsQuery.isLoading && !commentsQuery.isError && !commentsQuery.data?.items.length ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : null}
        {commentsQuery.data?.items.map((comment) => (
          <article key={comment.id} className="rounded-xl border border-border/80 bg-background p-3">
            <div className="mb-2 flex items-center gap-2">
              <Avatar.Root>
                <Avatar.Image
                  src={comment.author?.avatar_url?.trim() || undefined}
                  alt={`${getCommentAuthorName(comment.author?.nickname)} avatar`}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <Avatar.Fallback className="grid h-7 w-7 place-items-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  {getInitials(getCommentAuthorName(comment.author?.nickname))}
                </Avatar.Fallback>
              </Avatar.Root>
              <p className="truncate text-xs font-medium text-foreground">
                {getCommentAuthorName(comment.author?.nickname)}
              </p>
            </div>
            <p className="text-sm leading-6">{comment.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
