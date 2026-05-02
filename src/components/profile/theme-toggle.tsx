"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const themes = [
  { label: "System", value: "system" as const },
  { label: "Light", value: "light" as const },
  { label: "Dark", value: "dark" as const },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="rounded-xl border border-border/80 bg-background/70 p-4">
      <h2 className="text-sm font-semibold">Theme</h2>
      <p className="mt-1 text-xs text-muted-foreground">Choose how UX Anomalies looks on this device.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {themes.map((option) => {
          const active = theme === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(option.value)}
              aria-pressed={active}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
