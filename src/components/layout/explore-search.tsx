"use client";

import { FormEvent, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ExploreSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(activeQuery);

  const submit = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const next = value.trim();

    if (next) {
      params.set("q", next);
    } else {
      params.delete("q");
    }

    const qs = params.toString();
    const nextUrl = qs ? `/?${qs}` : "/";

    if (pathname === "/") {
      router.push(nextUrl);
      return;
    }

    router.push(nextUrl);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(query);
  };

  return (
    <form onSubmit={onSubmit} role="search" aria-label="Search UX anomalies">
      <label htmlFor="sidebar-explore" className="sr-only">
        Search UX anomalies
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="sidebar-explore"
          aria-label="Search UX anomalies"
          placeholder="Explore anomalies"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm outline-none ring-primary/60 placeholder:text-muted-foreground focus-visible:ring-2"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              submit("");
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </form>
  );
}
