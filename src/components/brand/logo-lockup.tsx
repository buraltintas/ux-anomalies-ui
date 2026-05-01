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
      <span className={cn("text-lg font-semibold tracking-tight text-foreground", textClassName)}>UX Anomalies</span>
    </span>
  );
}
