import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"]
  }
})