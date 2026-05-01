import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#15131A",
          color: "#FAF7F2",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="118" height="118" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="tw-grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C3AED" />
                <stop offset="1" stopColor="#4C1D95" />
              </linearGradient>
            </defs>
            <path
              d="M16 14H48L44 19L48 24L44 29L48 34L44 39L48 44M16 14C12.7 14 10 16.7 10 20V44C10 47.3 12.7 50 16 50H41"
              stroke="url(#tw-grad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M30 29L53 44L42 47L48 57L42 61L36 50L28 58L30 29Z"
              fill="url(#tw-grad)"
              stroke="#FAF7F2"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.03em" }}>UX Anomalies</div>
            <div style={{ fontSize: 30, color: "#E9E3DA" }}>Spot the strange side of everyday interfaces.</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
