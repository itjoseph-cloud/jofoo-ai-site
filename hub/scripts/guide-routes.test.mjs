import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {assertGuideSlugs, RESERVED_GUIDE_NAMES} from '../src/lib/guide-routes.mjs';

test('guide slugs reject reserved routes and every public entry', async () => {
  for (const name of [...RESERVED_GUIDE_NAMES, ...await readdir(new URL('../public/', import.meta.url))]) {
    await assert.rejects(assertGuideSlugs([name]), /collides with a reserved top-level name/);
  }
  await assert.doesNotReject(assertGuideSlugs(['sample-guide', 'about-ai']));
});

test('guide slug guard discovers new public files and directories', async () => {
  const dir = await mkdtemp(join(fileURLToPath(new URL('../', import.meta.url)), '.guide-routes-'));
  try {
    await mkdir(join(dir, 'new-assets'));
    await writeFile(join(dir, 'new-file.xml'), '');
    for (const slug of ['new-assets', 'new-assets/example', 'new-file.xml']) {
      await assert.rejects(assertGuideSlugs([slug], dir), /collides with a reserved top-level name/);
    }
    await assert.doesNotReject(assertGuideSlugs(['sample-guide'], dir));
  } finally {
    await rm(dir, {recursive: true, force: true});
  }
});
