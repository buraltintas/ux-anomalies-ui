import { ImageResponse } from "next/og";

const sizes = {
  "16": { width: 16, height: 16 },
  "32": { width: 32, height: 32 },
  "192": { width: 192, height: 192 },
  "512": { width: 512, height: 512 },
} as const;

export function generateImageMetadata() {
  return Object.entries(sizes).map(([id, size]) => ({
    id,
    contentType: "image/png",
    size,
  }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const iconId = String(await id);
  const size = sizes[iconId as keyof typeof sizes] ?? sizes["512"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F2",
          borderRadius: size.width >= 192 ? "22%" : "16%",
        }}
      >
        <svg width="78%" height="78%" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="icon-route-grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C3AED" />
              <stop offset="1" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
          <path
            d="M16 14H48L44 19L48 24L44 29L48 34L44 39L48 44M16 14C12.7 14 10 16.7 10 20V44C10 47.3 12.7 50 16 50H41"
            stroke="url(#icon-route-grad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30 29L53 44L42 47L48 57L42 61L36 50L28 58L30 29Z"
            fill="url(#icon-route-grad)"
            stroke="#FAF7F2"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
