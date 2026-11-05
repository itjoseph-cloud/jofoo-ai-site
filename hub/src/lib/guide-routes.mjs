import {readdir} from 'node:fs/promises';

export const RESERVED_GUIDE_NAMES = [
  'ar', 'prompts', 'newsletter', 'links', 'about', 'editorial-policy',
  'topics', 'pagefind', 'brand', 'fonts', '_astro', '404', 'rss.xml',
  'llms.txt', 'robots.txt', 'sitemap-index.xml', 'sitemap-0.xml',
];

export async function assertGuideSlugs(slugs, publicDir = 'public') {
  const reserved = new Set([...RESERVED_GUIDE_NAMES, ...await readdir(publicDir)]);
  for (const slug of slugs) {
    if (reserved.has(slug.split('/')[0])) {
      throw new Error(`Guide slug "${slug}" collides with a reserved top-level name`);
    }
  }
}
