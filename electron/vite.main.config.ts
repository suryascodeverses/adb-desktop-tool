import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        "electron",
        "path",
        "fs",
        "child_process",
        "@adb/core", // 🔑 THIS IS THE FIX
      ],
    },
  },
});
