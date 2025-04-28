import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Enable React support
  integrations: [react(), tailwind()],
  
  // Site configuration
  site: 'https://your-website.com',
  
  // Set up aliases for clearer imports
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@templates': path.resolve(__dirname, './src/templates'),
        '@partials': path.resolve(__dirname, './src/partials'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    }
  },
});