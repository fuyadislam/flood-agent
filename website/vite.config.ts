import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three-vendor';
          if (id.includes('/node_modules/d3-geo/') || id.includes('/node_modules/topojson-client/') || id.includes('/node_modules/world-atlas/')) return 'map-vendor';
        },
      },
    },
  },
});
