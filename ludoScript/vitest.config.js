import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  test: {
    // Mismos globals que en los tests (describe, it, expect) sin importarlos
    globals: false,
    // jsdom proporciona sessionStorage/localStorage para los módulos que los usan
    environment: "jsdom",
    // Archivos de setup globales si en el futuro hicieran falta
    // setupFiles: [],
  },
  resolve: {
    alias: {
      // Replica el alias @ de vite.config.js para que funcionen los imports
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
