import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "24%",
        }}
      >
        <svg width="78%" height="78%" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="apple-grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C3AED" />
              <stop offset="1" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
          <path
            d="M16 14H48L44 19L48 24L44 29L48 34L44 39L48 44M16 14C12.7 14 10 16.7 10 20V44C10 47.3 12.7 50 16 50H41"
            stroke="url(#apple-grad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30 29L53 44L42 47L48 57L42 61L36 50L28 58L30 29Z"
            fill="url(#apple-grad)"
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
