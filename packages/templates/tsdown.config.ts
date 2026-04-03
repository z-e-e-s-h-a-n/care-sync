import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  outDir: "dist",
  format: ["esm"],
  target: "es2024",
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false,
  deps: {
    neverBundle: [
      "react",
      "react-dom",
      "@react-email/render",
      "@react-email/components",
      "@workspace/db",
      "@workspace/shared",
      "@workspace/contracts",
    ],
  },
});
