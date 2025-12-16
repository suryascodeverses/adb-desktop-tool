import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/preload.ts"),
      formats: ["cjs"],
      fileName: () => "preload.js",
    },
    rollupOptions: {
      external: ["electron", "path", "fs"],
    },
  },
});
