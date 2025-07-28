module.exports = {
  purge: [
    './src/**/*.{js,jsx,ts,tsx}', 
    './public/index.html',       
  ],
  darkMode: false, 
  theme: {
    extend: {
      colors: {

      },
      fontFamily: {
        
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  variants: {
 
    extend: {},
  },
  plugins: [], // Add any Tailwind plugins here 
}
