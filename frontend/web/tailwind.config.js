/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f1d',
        surface: '#151b2d',
        primary: '#f57c00',    // IPL Orange
        primaryDark: '#e65100',
        navy: '#1a237e',       // IPL Blue
      }
    },
  },
  plugins: [],
}
