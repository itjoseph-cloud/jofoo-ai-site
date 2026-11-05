import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {checkAcceptance} from './check-acceptance.mjs';

test('published fixture reaches hubs, Article dates and both RSS feeds',()=>{
 const fixtures=[['en','review-fixture-new','2020-11-06T08:00-08:00'],['en','review-fixture-old','2020-11-05T08:00:00-08:00'],['ar','review-fixture-new','2020-11-06T08:00-08:00']];
 const created=[];
 try {
  for(const [lang,slug,publishOn] of fixtures){
   const file=`src/content/guides/${lang}/${slug}.mdx`;
   assert.equal(existsSync(file),false,'fixture must not overwrite content');
   const source=readFileSync('scripts/fixtures/guide.mdx','utf8').replace('lang: en',`lang: ${lang}`).replace('draft: true',`draft: false\npublishOn: "${publishOn}"\nupdatedOn: 2026-11-07`).replace(/qaRecord: .*/, 'qaRecord: QA-JAI-20261104-001-20261104').replace(/translationOf: .*/,'translationOf: review-fixture-new');
   writeFileSync(file,source);created.push(file);
  }
  const env={...process.env};delete env.INCLUDE_DRAFTS;
  const result=process.platform==='win32'?spawnSync('cmd.exe',['/d','/s','/c','npm.cmd run build'],{encoding:'utf8',env}):spawnSync('npm',['run','build'],{encoding:'utf8',env});
  assert.equal(result.status,0,result.stdout+result.stderr);
  checkAcceptance('build');
  for(const lang of ['en','ar']){
   const prefix=lang==='ar'?'ar/':'';
   const html=readFileSync(`dist/${prefix}review-fixture-new/index.html`,'utf8');
   assert.ok(html.includes(`data-infographic dir="${lang==='ar'?'rtl':'ltr'}"`));
   assert.ok(!html.includes('class="number" aria-hidden="true"'));
   const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
   const articles=blocks.flatMap(b=>b['@graph']??[b]).filter(b=>b['@type']==='Article');
   assert.equal(articles[0].datePublished,'2020-11-06T16:00:00.000Z');
   assert.equal(articles[0].dateModified,'2026-11-07T00:00:00.000Z');
   const rss=readFileSync(`dist/${prefix}rss.xml`,'utf8');
   const item=[...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].find(m=>m[1].includes('/review-fixture-new/'))[1];
   assert.ok(item.includes('<pubDate>Fri, 06 Nov 2020 16:00:00 GMT</pubDate>'));
  }
  const hub=readFileSync('dist/index.html','utf8');
  assert.ok(hub.indexOf('href="/guides/review-fixture-new/"')<hub.indexOf('href="/guides/review-fixture-old/"'));
 } finally {for(const file of created)unlinkSync(file);}
});
