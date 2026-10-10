// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://blog.modus.ai.kr',
  integrations: [mdx(), react(), sitemap()],
  trailingSlash: 'ignore',
});
