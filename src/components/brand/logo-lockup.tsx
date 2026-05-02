import { cn } from "@/lib/utils/cn";

import { LogoMark } from "@/components/brand/logo-mark";

interface LogoLockupProps {
  className?: string;
  markSize?: number;
  textClassName?: string;
  decorative?: boolean;
}

export function LogoLockup({
  className,
  markSize = 34,
  textClassName,
  decorative = true,
}: LogoLockupProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} decorative={decorative} />
      <span className={cn("inline-flex items-end gap-1 text-lg tracking-tight", textClassName)}>
        <span
          className={cn(
            "bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] bg-clip-text text-[1.02em] font-extrabold leading-none text-transparent",
          )}
        >
          UX
        </span>
        <span className="font-semibold leading-none text-foreground/95">Anomalies</span>
      </span>
    </span>
  );
}
