import type { CommentListResponse, CommentResponse, LikeResponse } from "@/lib/api/social-types";

export async function likeAnomaly(id: string) {
  const res = await fetch(`/api/anomalies/${id}/like`, { method: "POST" });
  if (!res.ok) throw await res.json().catch(() => ({ message: "Failed to like anomaly" }));
  return (await res.json()) as LikeResponse;
}

export async function unlikeAnomaly(id: string) {
  const res = await fetch(`/api/anomalies/${id}/like`, { method: "DELETE" });
  if (!res.ok) throw await res.json().catch(() => ({ message: "Failed to unlike anomaly" }));
  return (await res.json()) as LikeResponse;
}

export async function listComments(id: string, cursor?: string, limit = 50) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`/api/anomalies/${id}/comments?${params.toString()}`);
  if (!res.ok) throw await res.json().catch(() => ({ message: "Failed to load comments" }));
  return (await res.json()) as CommentListResponse;
}

export async function createComment(id: string, text: string) {
  const res = await fetch(`/api/anomalies/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw await res.json().catch(() => ({ message: "Failed to create comment" }));
  return (await res.json()) as CommentResponse;
}
