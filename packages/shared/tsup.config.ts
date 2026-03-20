import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    utils: "src/utils/index.ts",
    constants: "src/constants/index.ts",
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
