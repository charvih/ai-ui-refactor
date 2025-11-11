import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  // Next.js base configs
  ...nextVitals,
  ...nextTs,

  // ⬇️ Add Prettier plugin here
  {
    extends: ["plugin:prettier/recommended"],
  },

  // Default Next.js ignores
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
