import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this as a project site at /tiintiin-guesthouse/, so assets need that
  // prefix in production. CI (GitHub Actions) sets CI=true automatically; local dev/preview stays at '/'.
  base: process.env.CI ? '/tiintiin-guesthouse/' : '/',
  server: {
    // Native file events are unreliable on some Windows setups; polling never misses an edit.
    watch: { usePolling: true, interval: 250 },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion';
          return undefined;
        },
      },
    },
  },
});
