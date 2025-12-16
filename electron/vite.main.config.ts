import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: ["electron", "path", "fs"],
    },
  },
});
