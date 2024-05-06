/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,jsx,js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "color-1": "#228be6",
        "color-2": "#F0F0F0",
      },
      fontFamily: {
        primary: "Roboto",
      },
    },
  },
  plugins: ["postcss-preset-mantine"],
};
