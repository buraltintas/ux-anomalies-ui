'use client';

import * as React from 'react';

interface TooltipProps {
  label: string;
  children: React.ReactElement;
}

export function Tooltip({ label, children }: TooltipProps) {
  const id = React.useId();
  const child = children as React.ReactElement<{ "aria-describedby"?: string }>;
  const describedBy = child.props["aria-describedby"];
  const nextDescribedBy = [describedBy, id].filter(Boolean).join(' ');

  return (
    <span className='group relative inline-flex'>
      {React.cloneElement(child, {
        'aria-describedby': nextDescribedBy,
      })}
      <span
        id={id}
        role='tooltip'
        className='pointer-events-none absolute left-1/2 top-0 z-40 hidden -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] rounded-lg bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 md:block'
      >
        {label}
      </span>
    </span>
  );
}
