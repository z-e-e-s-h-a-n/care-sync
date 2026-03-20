import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    browser: "src/browser.ts",
    client: "src/client.ts",
    enums: "src/enums.ts",
  },
  outDir: "dist",
  format: ["esm"],
  target: "es2024",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false,
});
