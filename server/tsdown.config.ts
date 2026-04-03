import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  entry: ["src/main.ts"],
  outDir: "dist",
  target: "es2024",
  format: ["esm"],
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
  onSuccess: options.watch ? "node dist/main.mjs" : undefined,
  deps: {
    neverBundle: [
      "@workspace/shared",
      "@workspace/contracts",
      "@workspace/templates",
      "@workspace/db",
    ],
  },
}));
