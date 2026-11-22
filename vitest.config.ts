import { defineConfig } from "vitest/config";
import path from "node:path";
import type { UserConfig } from "vite";

const vitestEsbuild = {
  jsx: "automatic",
} as unknown as NonNullable<UserConfig["esbuild"]>;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "node_modules/next/dist/compiled/server-only/empty.js"),
    },
  },
  esbuild: vitestEsbuild,
  oxc: false,
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
