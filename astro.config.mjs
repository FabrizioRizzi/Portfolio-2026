// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Optimize build output
  build: {
    inlineStylesheets: 'auto', // Inline smaller CSS files
  },
  // Compress HTML output
  compressHTML: true,
  // Enable prefetch for faster navigation
  prefetch: {
    defaultStrategy: 'hover', // Prefetch on hover for better perceived performance
    prefetchAll: true, // Prefetch all internal links
  },
  // Optimize assets
  vite: {
    build: {
      cssCodeSplit: false, // Bundle all CSS into one file for better caching
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs in production
          passes: 2, // Multiple passes for better minification
        },
      },
    },
  },
});
