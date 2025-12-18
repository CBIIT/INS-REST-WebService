import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["lcov", "json", "html"],
      enabled: true,
    },
    testTimeout: 10_000,
  },
});
