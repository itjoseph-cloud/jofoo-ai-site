import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {readFileSync} from 'node:fs';
const mode=process.argv[2]??'preview';
const en='dist/sample-guide/index.html',ar='dist/ar/sample-guide/index.html';
assert.ok(existsSync('dist/topics/prompt-packs/index.html'));
assert.ok(existsSync('dist/ar/topics/prompt-packs/index.html'));
assert.match(readFileSync('dist/llms.txt','utf8'),/topics\/prompt-packs\//);
if(mode==='preview'){
 for(const [file,labels] of [[en,['The Problem','Why It Happens','The Fix','Step by Step']],[ar,['المشكلة','لماذا يحدث ذلك','الحل','خطوة بخطوة']]]){
  const html=readFileSync(file,'utf8');
  assert.match(html,/data-guide-cover/);
  assert.match(html,/<figure[^>]*data-infographic[^>]*>[\s\S]*?<figcaption[^>]*>[^<]+<\/figcaption><ol[^>]*>[\s\S]*?<\/ol><\/figure>/);
  for(const label of labels)assert.match(html,new RegExp(`<h2[^>]*>${label}</h2>`));
  const headings=[...html.matchAll(/<h2[^>]*data-guide-heading[^>]*>/g)];
  const cta=html.indexOf(file===en?'Keep a Prompt Pack Handy':'احتفظ بحزمة أوامر جاهزة');
  assert.ok(cta>headings[1].index&&cta<headings[2].index,'CTA sits between the second and third section headings');
  assert.ok(cta>html.indexOf('</section>',headings[1].index),'CTA comes after the second section ends, not inside it');
 }
}
if(mode==='preview'){
 for(const file of [en,ar]){assert.ok(existsSync(file),file);const text=readFileSync(file,'utf8');for(const token of ['hreflang="en"','hreflang="ar"','hreflang="x-default"','rel="canonical"','"@type":"Article"','data-copy'])assert.ok(text.includes(token),`${file}: ${token}`);const headings=[...text.matchAll(/<h2[^>]*>/g)];assert.ok(headings.length>=2);const cta=file===en?'Keep a Prompt Pack Handy':'احتفظ بحزمة أوامر جاهزة';assert.ok(text.indexOf(cta)>headings[1].index);assert.equal(text.split(cta).length-1,1);}
 assert.ok(readFileSync(ar,'utf8').includes('dir="rtl"'));
 assert.ok(readFileSync('dist/sitemap-0.xml','utf8').includes('xhtml:link'));
}else{assert.ok(!existsSync(en));assert.ok(!existsSync(ar));assert.ok(readFileSync('dist/index.html','utf8').includes('First guides are on the way. Get them by email.'));assert.ok(existsSync('dist/pagefind/pagefind.js'));}
const sitemap=readFileSync('dist/sitemap-0.xml','utf8');
for(const file of ['dist/404.html','dist/newsletter/thanks/index.html','dist/ar/newsletter/thanks/index.html']){
 const html=readFileSync(file,'utf8');
 assert.match(html,/<meta name="robots" content="noindex"/);
 if(file.endsWith('404.html')){assert.doesNotMatch(html,/rel="canonical"/);assert.doesNotMatch(html,/<link[^>]*hreflang=/);}
}
assert.doesNotMatch(sitemap,/\/(?:404(?:\.html)?|newsletter\/thanks)\/?</);
if(mode==='preview'){
 for(const [file,label] of [[en,'Breadcrumb'],[ar,'مسار التنقل']]){
  const html=readFileSync(file,'utf8');
  assert.ok(html.includes(`aria-label="${label}"`));
  assert.match(html,/aria-current="page"/);
 }
}else{
 for(const file of ['dist/index.html','dist/ar/index.html'])assert.doesNotMatch(readFileSync(file,'utf8'),/id="guide-count"/);
}
const png=readFileSync('public/og-default.png');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
console.log(`${mode}: acceptance checks passed`);
