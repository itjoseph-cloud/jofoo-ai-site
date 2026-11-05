import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {parse} from 'yaml';
import {BASE_URL} from '../src/lib/site.mjs';

export function discoverGuides(root='src/content/guides') {
 return readdirSync(root,{withFileTypes:true}).flatMap(entry=>{
  const file=join(root,entry.name);
  if(entry.isDirectory())return discoverGuides(file);
  if(!/\.mdx?$/.test(file))return [];
  const frontmatter=readFileSync(file,'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return [{slug:basename(file).replace(/\.mdx?$/,''),data:parse(frontmatter[1])}];
 });
}
export const draftSamples=guides=>guides.filter(g=>g.data.draft);
const route=g=>`${g.data.lang==='ar'?'ar/':''}${g.slug}/index.html`;
const empty={en:'First guides are on the way. Get them by email.',ar:'الأدلة الأولى قادمة. احصل عليها عبر البريد الإلكتروني.'};
export function checkBuildHubs(guides,read,exists,now=new Date()) {
 const published=guides.filter(g=>!g.data.draft&&(!g.data.publishOn||Date.parse(g.data.publishOn)<=now.valueOf()));
 for(const lang of ['en','ar']){
  const items=published.filter(g=>g.data.lang===lang);
  const html=read(`${lang==='ar'?'ar/':''}index.html`);
  if(!items.length){assert.ok(html.includes(empty[lang]),`${lang}: empty state`);assert.doesNotMatch(html,/id="guide-count"/);}
  else {
   assert.match(html,new RegExp(`id="guide-count"[^>]*>${items.length}</span>`));
   for(const text of Object.values(empty))assert.ok(!html.includes(text),'published hub must not show empty text');
   for(const g of items){assert.ok(html.includes(`href="${BASE_URL}${lang==='ar'?'ar/':''}${g.slug}/"`));assert.ok(exists(route(g)));}
  }
 }
 for(const g of guides.filter(g=>!published.includes(g)))assert.ok(!exists(route(g)),`unpublished: ${g.slug}`);
}
export function checkAcceptance(mode='preview') {
 const read=file=>readFileSync(join('dist',file),'utf8');
 const exists=file=>existsSync(join('dist',file));
 const guides=discoverGuides();
 for(const prefix of ['','ar/'])assert.ok(exists(`${prefix}topics/prompt-packs/index.html`));
 assert.match(read('llms.txt'),/topics\/prompt-packs\//);
 if(mode==='preview')for(const g of draftSamples(guides)){
  const html=read(route(g)),ar=g.data.lang==='ar';
  assert.match(html,/data-guide-cover/);
  assert.match(html,/<figure[^>]*data-infographic[^>]*>[\s\S]*?<figcaption[^>]*>[^<]+<\/figcaption><ol[^>]*>[\s\S]*?<\/ol><\/figure>/);
  for(const label of ar?['المشكلة','لماذا يحدث ذلك','الحل','خطوة بخطوة']:['The Problem','Why It Happens','The Fix','Step by Step'])assert.ok(html.includes(`>${label}</h2>`));
  const headings=[...html.matchAll(/<h2[^>]*data-guide-heading[^>]*>/g)];
  const ctaLabel=ar?'احتفظ بحزمة أوامر جاهزة':'Keep a Prompt Pack Handy',cta=html.indexOf(ctaLabel);
  assert.ok(cta>html.indexOf('</section>',headings[1].index)&&cta<headings[2].index,'CTA follows second section');
  assert.equal(html.split(ctaLabel).length-1,1);
  for(const token of ['rel="canonical"','"@type":"Article"','data-copy','aria-current="page"',`aria-label="${ar?'مسار التنقل':'Breadcrumb'}"`])assert.ok(html.includes(token),token);
  if(ar)assert.ok(html.includes('dir="rtl"'));
  if(guides.some(other=>other.data.lang!==g.data.lang&&other.slug===g.data.translationOf))for(const lang of ['en','ar','x-default'])assert.ok(html.includes(`hreflang="${lang}"`));
 }
 else {checkBuildHubs(guides,read,exists);assert.ok(exists('pagefind/pagefind.js'));}
 const sitemap=read('sitemap-0.xml');
 for(const file of ['404.html','newsletter/thanks/index.html','ar/newsletter/thanks/index.html']){
  const html=read(file);assert.match(html,/<meta name="robots" content="noindex"/);
  if(file==='404.html'){assert.doesNotMatch(html,/rel="canonical"/);assert.doesNotMatch(html,/<link[^>]*hreflang=/);}
 }
 assert.doesNotMatch(sitemap,/\/(?:404(?:\.html)?|newsletter\/thanks)\/?</);
 const png=readFileSync('public/og-default.png');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 console.log(`${mode}: acceptance checks passed`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)checkAcceptance(process.argv[2]??'preview');
