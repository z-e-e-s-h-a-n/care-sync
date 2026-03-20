import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/main.ts"],
  outDir: "dist",
  target: "es2024",
  format: ["esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
  onSuccess: options.watch ? "node dist/main.js" : undefined,
  external: [
    "@workspace/shared",
    "@workspace/contracts",
    "@workspace/templates",
    "@workspace/db",
  ],
}));
