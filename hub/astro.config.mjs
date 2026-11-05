import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://jofoo.tech', base: '/jofooai', trailingSlash: 'always', output: 'static',
  i18n: { defaultLocale: 'en', locales: ['en', 'ar'], routing: { prefixDefaultLocale: false } },
  integrations: [mdx(), sitemap({ filter: page => !/\/(?:404(?:\.html)?|newsletter\/thanks)\/?$/.test(new URL(page).pathname), i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } } })],
});
