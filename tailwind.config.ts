import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D1118',  // fond principal anthracite/noir
        surface: '#131925',     // surfaces
        card: '#1A2232',        // cartes
        border: '#232C3D',
        text: '#F2F4F8',        // texte principal clair
        muted: '#AAB4C5',       // sous-texte
        accent: '#C6A15B',      // doré (accent)
        accentDark: '#A6843F',  // doré foncé
        highlight: '#0F1420',   // hover/fond léger
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 40px rgba(0,0,0,0.24)',
        soft: '0 10px 30px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}

export default config