// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { remarkImageCaption } from './src/plugins/remark-image-caption.mjs';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkImageCaption],
  },
});
