import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    auth: "src/auth/index.ts",
    user: "src/user/index.ts",
    admin: "src/admin/index.ts",
    audit: "src/audit/index.ts",
    business: "src/business/index.ts",
    dashboard: "src/dashboard/index.ts",
    media: "src/media/index.ts",
    notification: "src/notification/index.ts",
    lead: "src/lead/index.ts",
    traffic: "src/traffic/index.ts",
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
