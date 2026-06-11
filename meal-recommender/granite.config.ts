import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "meal-recommender",
  brand: {
    displayName: "뭐먹지?",
    primaryColor: "#FF6B35",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
