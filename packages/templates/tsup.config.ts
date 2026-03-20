import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  outDir: "dist",
  format: ["esm"],
  target: "es2024",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false,
  external: [
    "react",
    "react-dom",
    "@react-email/render",
    "@react-email/components",
    "@workspace/shared",
    "@workspace/contracts",
  ],
});
