/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
    "./src/features/auth/**/*.{js,jsx,ts,tsx}",
    "./src/features/home/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        "primary-container": "#EDE9FE",
        secondary: "#0284C7",
        "secondary-container": "#E0F2FE",
        tertiary: "#DB2777",
        "tertiary-container": "#FCE7F3",
        background: "#FFFFFF",
        surface: "#F9FAFB",
        "surface-variant": "#F3F4F6",
        "on-background": "#111827",
        "on-surface": "#1F2937",
        "on-surface-variant": "#4B5563",
        outline: "#E5E7EB",
        "outline-variant": "#D1D5DB",
      },
      fontFamily: {
        headline: ["PlusJakartaSans-Bold"],
        body: ["Inter-Regular"],
        label: ["Inter-Medium"],
      },
    },
  },
  plugins: [],
};
