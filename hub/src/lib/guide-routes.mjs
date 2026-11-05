import {readdir} from 'node:fs/promises';

export const STATIC_PAGE_SUFFIXES = [
  '', 'prompts', 'newsletter', 'newsletter/thanks', 'links', 'about', 'editorial-policy',
];

export const RESERVED_GUIDE_NAMES = [
  ...new Set(STATIC_PAGE_SUFFIXES.map(suffix => suffix.split('/')[0])),
  'ar', 'topics', 'pagefind', 'brand', 'fonts', '_astro', '404', '404.html', 'rss.xml',
  'llms.txt', 'robots.txt', 'sitemap-index.xml',
];

export async function assertGuideSlugs(slugs, publicDir = 'public') {
  const reserved = new Set([...RESERVED_GUIDE_NAMES, ...await readdir(publicDir)]);
  const seen = new Set();
  for (const {lang, slug} of slugs) {
    const name = slug.split('/')[0];
    if (reserved.has(name) || /^sitemap-\d+\.xml$/.test(name)) {
      throw new Error(`Guide slug "${slug}" collides with a reserved top-level name`);
    }
    if (slug.includes('.')) throw new Error(`Guide slug "${slug}" must not contain a dot`);
    const key = JSON.stringify([lang, slug]);
    if (seen.has(key)) throw new Error(`Duplicate guide slug "${slug}" in language "${lang}"`);
    seen.add(key);
  }
}
