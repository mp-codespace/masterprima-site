import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // === Point 1: Glob pattern for ALL route.ts files ===
  {
    files: ["**/route.ts"], // This matches ALL route.ts files anywhere in your project
    rules: {
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-nocheck": false,      // Allow @ts-nocheck
          "ts-ignore": true,
          "ts-expect-error": true,
          "ts-check": true
        }
      ]
    }
  }
];

export default eslintConfig;
