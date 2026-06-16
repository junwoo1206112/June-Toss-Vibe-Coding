import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "meal-recommender",
  brand: {
    displayName: "뭐먹지?",
    primaryColor: "#FF6B35",
    icon: "https://static.toss.im/appsintoss/50835/1627f137-d8d9-45f9-a068-3a1435b5e2b8.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [{ name: "geolocation", access: "access" }],
  outdir: "dist",
});
