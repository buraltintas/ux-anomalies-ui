"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";

type ShareAnomalyButtonProps = {
  title: string;
  url: string;
  text?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">;

function isShareCancel(error: unknown) {
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
}

export function ShareAnomalyButton({ title, url, text, className, ...buttonProps }: ShareAnomalyButtonProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch (error) {
      if (isShareCancel(error)) {
        return;
      }
      toast.error("Could not share this anomaly right now.");
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted",
        className,
      )}
      aria-label="Share anomaly"
      onClick={handleShare}
      {...buttonProps}
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
