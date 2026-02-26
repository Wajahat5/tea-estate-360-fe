import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";

export default [
    {
        files: ["src/**/*.{ts,tsx}"],
        ignores: ["dist/**", "backend/**"],
        languageOptions: {
            parser: typescriptEslintParser,
            ecmaVersion: 2020,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            "@typescript-eslint": typescriptEslintPlugin,
            "react-hooks": reactHooksPlugin,
            "react-refresh": reactRefreshPlugin
        },
        rules: {
            "react-refresh/only-export-components": [
                "warn",
                { "allowConstantExport": true }
            ]
        }
    }
];