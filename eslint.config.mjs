import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Next.js base configs
  ...nextVitals,
  ...nextTs,

  prettierRecommended,

  // Default Next.js ignores
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
