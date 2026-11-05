import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { SITE_ORIGIN, BASE_PATH } from './src/lib/site.mjs';
export default defineConfig({
  site: SITE_ORIGIN, base: BASE_PATH, trailingSlash: 'always', output: 'static',
  i18n: { defaultLocale: 'en', locales: ['en', 'ar'], routing: { prefixDefaultLocale: false } },
  integrations: [mdx(), sitemap({ filter: page => !/\/(?:404(?:\.html)?|newsletter\/thanks)\/?$/.test(new URL(page).pathname), i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } } })],
});
