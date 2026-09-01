import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the "@/*" path alias in tsconfig.json. Without this, any test
      // importing a module that uses "@/" fails to resolve at run time even
      // though tsc is happy — a mismatch that has already cost us once.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    passWithNoTests: true,
  },
});
