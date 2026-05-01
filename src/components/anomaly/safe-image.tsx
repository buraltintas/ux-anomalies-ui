/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackText?: string;
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackText = "No preview image",
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={fallbackClassName}>{fallbackText}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
