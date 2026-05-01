"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { SafeImage } from "@/components/anomaly/safe-image";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  url?: string;
}

interface Props {
  images?: GalleryImage[];
  title?: string;
}

export function AnomalyImageGallery({ images, title }: Props) {
  const validImages = useMemo(() => (images ?? []).filter((image) => Boolean(image?.url?.trim())), [images]);
  const [index, setIndex] = useState(0);

  if (!validImages.length) {
    return (
      <div className="aspect-[16/10] bg-muted">
        <SafeImage
          src={undefined}
          alt={title || "Anomaly preview"}
          className="h-full w-full object-cover"
          fallbackClassName="grid h-full place-items-center text-sm text-muted-foreground"
          fallbackText="No image provided"
        />
      </div>
    );
  }

  if (validImages.length === 1) {
    return (
      <div className="aspect-[16/10] bg-muted">
        <SafeImage
          src={validImages[0]?.url}
          alt={title || "Anomaly preview"}
          className="h-full w-full object-cover"
          fallbackClassName="grid h-full place-items-center text-sm text-muted-foreground"
          fallbackText="Image unavailable"
        />
      </div>
    );
  }

  const current = validImages[index] ?? validImages[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] bg-muted">
        <SafeImage
          src={current?.url}
          alt={`${title || "Anomaly"} screenshot ${index + 1}`}
          className="h-full w-full object-cover"
          fallbackClassName="grid h-full place-items-center text-sm text-muted-foreground"
          fallbackText="Image unavailable"
        />
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full"
            aria-label="Previous image"
            onClick={() => setIndex((prev) => (prev - 1 + validImages.length) % validImages.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="rounded-full bg-foreground/85 px-2 py-0.5 text-xs font-medium text-background">
            {index + 1} / {validImages.length}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full"
            aria-label="Next image"
            onClick={() => setIndex((prev) => (prev + 1) % validImages.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 px-1">
        {validImages.map((image, imageIndex) => (
          <button
            key={`${image.url}-${imageIndex}`}
            type="button"
            className={`overflow-hidden rounded-lg border ${
              imageIndex === index ? "border-primary" : "border-border/70"
            }`}
            aria-label={`Show image ${imageIndex + 1}`}
            onClick={() => setIndex(imageIndex)}
          >
            <div className="aspect-[4/3] bg-muted">
              <SafeImage
                src={image.url}
                alt={`${title || "Anomaly"} thumbnail ${imageIndex + 1}`}
                className="h-full w-full object-cover"
                fallbackClassName="grid h-full place-items-center text-[10px] text-muted-foreground"
                fallbackText="N/A"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
