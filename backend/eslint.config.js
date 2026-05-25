import js from "@eslint/js";
import n from "eslint-plugin-n";
import security from "eslint-plugin-security";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  n.configs["flat/recommended"],
  security.configs.recommended,
  prettier,
  {
    languageOptions: { ecmaVersion: 2024, sourceType: "module" },
    rules: {
      "no-throw-literal": "error",
      "no-return-await": "off",
      "require-await": "error",
      "n/no-process-exit": "off",
      "n/no-missing-import": "off",
    },
  },
  {
    ignores: ["node_modules/", "generated/"],
  },
];
