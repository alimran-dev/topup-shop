/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#fa6023',
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
};
