import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://apizel.liha.dev',
  integrations: [react()],
  outDir: './dist',
  srcDir: './src',
  publicDir: './public',
  vite: {
    ssr: {
      noExternal: [/react-syntax-highlighter/, /@babel\/runtime/, /prismjs/],
    },
  },
});
