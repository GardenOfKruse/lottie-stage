import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base path must match the GitHub Pages repo name (lowercase, hyphenated).
export default defineConfig({
  base: '/lottie-stage/',
  plugins: [react()],
});