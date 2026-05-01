import { cn } from "@/lib/utils/cn";

interface LogoMarkProps {
  size?: number;
  className?: string;
  title?: string;
  decorative?: boolean;
}

export function LogoMark({ size = 36, className, title, decorative = true }: LogoMarkProps) {
  const labelled = Boolean(title) && !decorative;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role={labelled ? "img" : "presentation"}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled ? title : undefined}
    >
      <defs>
        <linearGradient id="uxa-mark-grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#4C1D95" />
        </linearGradient>
      </defs>

      <path
        d="M16 14H48L44 19L48 24L44 29L48 34L44 39L48 44M16 14C12.7 14 10 16.7 10 20V44C10 47.3 12.7 50 16 50H41"
        fill="none"
        stroke="url(#uxa-mark-grad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M30 29L53 44L42 47L48 57L42 61L36 50L28 58L30 29Z"
        fill="url(#uxa-mark-grad)"
        stroke="#FAF7F2"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
