import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Pravidla over-restrictive pro CZ content — over-escapování uvozovek zatěžuje
  // čitelnost copy a Next.js build s nimi stejně neselže.
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // Mount-only setState patterns (localStorage check, consent gate, script
      // injection) jsou idiomatické a běžné v Next.js client komponentech.
      // React 19 doc tento warning přidal, ale pro 100% korektní refactor by
      // bylo nutné useSyncExternalStore nebo lazy initial state — over-engineering.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
