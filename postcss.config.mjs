/** Webpack / `next build --webpack` CSS pipeline (Turbopack uses @tailwindcss/turbopack instead). */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
