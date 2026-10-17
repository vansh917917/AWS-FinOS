import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          deep: "var(--finos-navy-deep)",
          DEFAULT: "var(--finos-navy)",
          surface: "var(--finos-navy-surface)",
        },
        finos: {
          blue: "var(--finos-blue)",
          "blue-hover": "var(--finos-blue-hover)",
          surface: "var(--finos-surface)",
          bg: "var(--finos-background)",
          border: "var(--finos-border)",
          text: "var(--finos-text)",
          muted: "var(--finos-muted)",
        },
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
        },
      },
    },
  },
  plugins: [],
};

export default config;
