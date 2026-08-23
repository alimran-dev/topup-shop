/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // RGB-triplet CSS variables so every primary/secondary utility is
        // runtime-themable (per-subscription-type theming). The <alpha-value>
        // slot keeps opacity modifiers (primary/30, border-opacity-60) working.
        primary: 'rgb(var(--theme-primary) / <alpha-value>)',
        secondary: 'rgb(var(--theme-secondary) / <alpha-value>)',
      }
    },
  },
  plugins: [
    daisyui,
  ],
};
