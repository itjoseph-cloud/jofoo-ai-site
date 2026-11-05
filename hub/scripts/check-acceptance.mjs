import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {readFileSync} from 'node:fs';
const mode=process.argv[2]??'preview';
const en='dist/guides/sample-guide/index.html',ar='dist/ar/guides/sample-guide/index.html';
if(mode==='preview'){
 for(const file of [en,ar]){assert.ok(existsSync(file),file);const text=readFileSync(file,'utf8');for(const token of ['hreflang="en"','hreflang="ar"','hreflang="x-default"','rel="canonical"','"@type":"Article"','data-copy'])assert.ok(text.includes(token),`${file}: ${token}`);const headings=[...text.matchAll(/<h2[^>]*>/g)];assert.ok(headings.length>=2);const cta=file===en?'Keep a Prompt Pack Handy':'احتفظ بحزمة توجيهات جاهزة';assert.ok(text.indexOf(cta)>headings[1].index);assert.equal(text.split(cta).length-1,1);}
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
