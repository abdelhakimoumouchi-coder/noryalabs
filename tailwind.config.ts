import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1C1F26', // gris anthracite
        surface: '#FFFFFF',    // blanc
        text: '#1C1F26',       // texte principal
        muted: '#E5E7EB',      // gris clair
        accent: '#3A6EA5',     // bleu acier
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config