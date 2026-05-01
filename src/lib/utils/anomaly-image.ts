import type { Anomaly } from '@/lib/api/types';

export function normalizeNonEmpty(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeCount(value: unknown) {
  if (value === null || value === undefined) return 0;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, numeric);
}

export function getFeedPreviewImage(
  anomaly: Partial<Anomaly> | undefined | null,
) {
  if (!anomaly) return undefined;
  return (
    normalizeNonEmpty(anomaly.thumbnail_url) ??
    normalizeNonEmpty(anomaly.thumbnailUrl) ??
    normalizeNonEmpty(anomaly.image_url) ??
    normalizeNonEmpty(anomaly.images?.[0]?.url) ??
    undefined
  );
}

export function getDetailPreviewImage(
  anomaly: Partial<Anomaly> | undefined | null,
) {
  if (!anomaly) return undefined;
  return (
    normalizeNonEmpty(anomaly.images?.[0]?.url) ??
    normalizeNonEmpty(anomaly.thumbnail_url) ??
    normalizeNonEmpty(anomaly.thumbnailUrl) ??
    undefined
  );
}

export function getLikeCount(anomaly: Partial<Anomaly> | undefined | null) {
  if (!anomaly) return 0;
  return normalizeCount(
    anomaly.like_count ?? anomaly.likeCount ?? anomaly.likes_count ?? 0,
  );
}

export function getCommentCount(anomaly: Partial<Anomaly> | undefined | null) {
  if (!anomaly) return 0;
  return normalizeCount(
    anomaly.comment_count ??
      anomaly.commentCount ??
      anomaly.comments_count ??
      0,
  );
}

export function getImageCount(anomaly: Partial<Anomaly> | undefined | null) {
  if (!anomaly) return 0;
  return normalizeCount(
    anomaly.image_count ?? anomaly.imageCount ?? anomaly.images?.length ?? 0,
  );
}

export function getViewerHasLiked(
  anomaly: Partial<Anomaly> | undefined | null,
) {
  if (!anomaly) return false;
  return anomaly.viewer_has_liked ?? anomaly.viewerHasLiked ?? false;
}

export function hasViewerHasLiked(
  anomaly: Partial<Anomaly> | undefined | null,
) {
  if (!anomaly) return false;
  return (
    anomaly.viewer_has_liked !== undefined &&
    anomaly.viewer_has_liked !== null
  ) || (anomaly.viewerHasLiked !== undefined && anomaly.viewerHasLiked !== null);
}

export function getThumbnailUrl(anomaly: Partial<Anomaly> | undefined | null) {
  if (!anomaly) return undefined;
  return (
    normalizeNonEmpty(anomaly.thumbnail_url) ??
    normalizeNonEmpty(anomaly.thumbnailUrl) ??
    undefined
  );
}
