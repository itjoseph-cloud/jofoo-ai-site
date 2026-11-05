import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm, readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {assertGuideSlugs, RESERVED_GUIDE_NAMES, STATIC_PAGE_SUFFIXES} from '../src/lib/guide-routes.mjs';

test('guide slugs reject reserved routes and every public entry', async () => {
  for (const name of [...RESERVED_GUIDE_NAMES, ...await readdir(new URL('../public/', import.meta.url))]) {
    await assert.rejects(assertGuideSlugs([{lang: 'en', slug: name}]), /collides with a reserved top-level name/);
  }
  await assert.doesNotReject(assertGuideSlugs(['sample-guide', 'about-ai'].map(slug => ({lang: 'en', slug}))));
});

test('guide slugs reject duplicates within a language but allow translations', async () => {
  // Nested IDs en/a/foo and en/b/foo both produce the final-segment slug foo.
  for (const lang of ['en', 'ar']) {
    await assert.rejects(assertGuideSlugs([{lang, slug: 'foo'}, {lang, slug: 'foo'}]), /Duplicate guide slug/);
  }
  await assert.doesNotReject(assertGuideSlugs([{lang: 'en', slug: 'foo'}, {lang: 'ar', slug: 'foo'}]));
});

test('guide slugs reject dots anywhere', async () => {
  for (const slug of ['example.html', 'guide.v2', '.hidden', 'nested/file.name', 'trailing.']) {
    await assert.rejects(assertGuideSlugs([{lang: 'en', slug}]), /must not contain a dot/);
  }
});

test('static pages and numbered sitemaps are reserved', async () => {
  for (const slug of [...STATIC_PAGE_SUFFIXES, '404.html', 'sitemap-0.xml', 'sitemap-42.xml', 'sitemap-999.xml']) {
    await assert.rejects(assertGuideSlugs([{lang: 'en', slug}]), /collides with a reserved top-level name/);
  }
});

test('guide slug guard discovers new public files and directories', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'guide-routes-'));
  try {
    await mkdir(join(dir, 'new-assets'));
    await writeFile(join(dir, 'new-file.xml'), '');
    for (const slug of ['new-assets', 'new-assets/example', 'new-file.xml']) {
      await assert.rejects(assertGuideSlugs([{lang: 'en', slug}], dir), /collides with a reserved top-level name/);
    }
    await assert.doesNotReject(assertGuideSlugs([{lang: 'en', slug: 'sample-guide'}], dir));
  } finally {
    await rm(dir, {recursive: true, force: true});
  }
});
