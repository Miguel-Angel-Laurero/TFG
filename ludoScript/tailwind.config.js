/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',      // Fondo
          surface: '#1E293B',   // Cards / Nav
          primary: '#6366F1',   // Botones principales
          secondary: '#A855F7', // Acentos / XP
          accent: '#F59E42',    // Detalles/acento naranja
          warning: '#FBBF24',   // Amarillo para alertas
          success: '#10B981',   // Progreso / Racha
          text: '#F8FAFC',      // Texto base
          muted: '#94A3B8',     // Texto secundario
        },
      },
      backgroundImage: {
        'radial-brand': 'radial-gradient(circle, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
