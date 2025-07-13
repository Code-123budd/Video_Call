// ✅ CORRECT way as per Tailwind's latest postcss plugin
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer')
  ],
}

