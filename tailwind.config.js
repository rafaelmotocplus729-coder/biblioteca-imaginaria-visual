/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        library: {
          bg: '#FBF8F3', // Papel / marfim suave
          paper: '#FFFFFF',
          darkBg: '#121316', // Carvão de biblioteca noturna
          darkPaper: '#1A1C20',
          darkBorder: '#2D3139',
          wood: '#5C3D2E',
          woodDark: '#2E1E17',
          accent: '#8C5032',
          gold: '#C59B27',
          parchment: '#F4ECE1'
        },
        area: {
          metodo: '#4A5568', // Ardósia sóbria
          ingles: '#2B6CB0', // Azul clássico
          literatura: '#805AD5', // Roxo profundo
          politica: '#C53030', // Vermelho terracota
          psicologia: '#DD6B20', // Âmbar quente
          antropologia: '#D69E2E', // Ocre terroso
          filosofia: '#319795', // Verde petróleo / ciano escuro
          historia: '#744210', // Marrom sépia
          historiaIgreja: '#975A16', // Dourado escuro / âmbar eclesiástico
          economia: '#2F855A', // Verde oliva escuro
          sociologia: '#3182CE', // Azul ardósia
          catolicismo: '#6B46C1', // Violeta litúrgico
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
