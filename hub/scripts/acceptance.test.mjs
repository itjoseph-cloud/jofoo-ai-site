import test from 'node:test';
import assert from 'node:assert/strict';
import {target} from './check-utils.mjs';
test('Link validation honors project base and external origins',()=>{assert.match(target('/guides/ar/example/'),/dist[\\/]ar[\\/]example[\\/]index.html$/);assert.equal(target('https://example.com/'),null);assert.equal(target('/outside/'),null);});

test('Domain-root legal pages are outside the hub build',()=>{for(const page of ['privacy.html','terms.html'])assert.equal(target(`https://jofooai.jofoo.tech/${page}`),null);assert.match(target('https://jofooai.jofoo.tech/guides/example/'),/dist[\\/]example[\\/]index.html$/);assert.equal(target('https://jofooai.jofoo.tech/outside/'),null);});

test('All same-origin paths outside the base are listed as external',()=>{for(const url of ['/', '/index.html', '/privacy.html', '/terms.html', '/media/example.png', '/guides-other/', '/guides', '../outside/'])assert.equal(target(url),null);});

import {readFileSync} from 'node:fs';
import {checkBuildHubs,draftSamples,discoverGuides} from './check-acceptance.mjs';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/publication.json',import.meta.url),'utf8'));
const emptyAr='الأدلة الأولى قادمة. احصل عليها عبر البريد الإلكتروني.';
const emptyEn='First guides are on the way. Get them by email.';
test('build fixture changes from empty hub to first published guide at the boundary',()=>{
 const pages={'index.html':emptyEn,'ar/index.html':emptyAr};
 const read=p=>pages[p],exists=p=>p in pages;
 checkBuildHubs(fixture,read,exists,new Date('2026-11-06T15:59:59Z'));
 pages['index.html']='<span id="guide-count">1</span><a href="/guides/first-guide/">Guide</a>';
 pages['first-guide/index.html']='Guide';
 checkBuildHubs(fixture,read,exists,new Date('2026-11-06T16:00:00Z'));
 for(const broken of [emptyEn,pages['index.html']+emptyEn,pages['index.html'].replace('>1<','>2<'),pages['index.html'].replace('first-guide/','wrong/')]){
  assert.throws(()=>checkBuildHubs(fixture,p=>p==='index.html'?broken:read(p),exists,new Date('2026-11-06T16:00:00Z')));
 }
});
test('preview samples are dynamic and may be absent',()=>{
 assert.deepEqual(draftSamples(fixture).map(g=>g.slug),['renamed-example']);
 assert.deepEqual(draftSamples(fixture.filter(g=>!g.data.draft)),[]);
 assert.ok(discoverGuides().every(g=>g.slug&&g.data.lang));
});
