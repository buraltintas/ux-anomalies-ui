import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UX Anomalies",
    short_name: "UX Anomalies",
    description: "Social platform for spotting real-world UX anomalies.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
