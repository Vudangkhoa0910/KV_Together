module.exports = {
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff8f1',
          100: '#feecd3',
          500: '#f97316',
          600: '#ea580c', 
        },
        red: {
          400: '#f87171',
          600: '#dc2626',
        },
        yellow: {
          300: '#fcd34d',
          400: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}
