import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Next.js base configs
  ...nextVitals,
  ...nextTs,

  {
    extends: ["plugin:prettier/recommended"],
  },

  // Default Next.js ignores
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
