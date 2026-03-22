import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["scripts/**/*.{js,cjs,mjs}", "*.config.{js,cjs,mjs,ts}", "tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".cache/**",
    ".vercel/**",
    "newdesign/**",
    "components/**",
    "src/components/choiceguide/**",
    "*.log",
    "*.js",
    "ProductContent.new.tsx",
    "scripts/debug*.*",
    "scripts/check_no_hero.mjs",
    "scripts/test_yahoo_image.mjs",
    "scripts/verify-live.mjs",
    "scripts/verify_products.mjs",
    "scripts/verify_products_old.mjs",
  ]),
]);

export default eslintConfig;
