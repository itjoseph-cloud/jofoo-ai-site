import test from 'node:test';
import assert from 'node:assert/strict';
import {guideSchema} from '../src/lib/guide-schema.mjs';
import {isHttpsUrl,findCounterpart,videoMetadata} from '../src/lib/content-rules.mjs';
import {hasProhibitedWording} from './check-wording.mjs';
const valid={contentId:'JAI-20261104-001',lang:'en',title:'Example',description:'A'.repeat(120),promise:'Help',pillar:'tools',segment:'beginners',level:'beginner',tools:['Example'],cost:'0',timeMinutes:1,verifiedOn:'2026-11-04',sources:[{title:'Docs',url:'https://example.com/',accessed:'2026-11-04'}],riskLevel:'LOW',qaRecord:'QA-JAI-20261104-001-20261104',primaryKeyword:'example',secondaryKeywords:[],faq:[]};
test('QA records require complete IDs and approval for elevated risk',()=>{
 for(const riskLevel of ['MEDIUM','HIGH']){
  for(const qaRecord of ['QA-APPROVED-','PENDING',valid.qaRecord,'QA-APPROVED-JAI-20261104-001-20261104-extra'])assert.equal(guideSchema.safeParse({...valid,riskLevel,qaRecord}).success,false);
  assert.ok(guideSchema.safeParse({...valid,riskLevel,qaRecord:'QA-APPROVED-JAI-20261104-001-20261104'}).success);
 }
 assert.ok(guideSchema.safeParse(valid).success);
 assert.equal(guideSchema.safeParse({...valid,qaRecord:'PENDING'}).success,false);
 assert.ok(guideSchema.safeParse({...valid,draft:true,qaRecord:'PENDING'}).success);
});
test('sources and Shot URL validator accept HTTPS only',()=>{
 for(const url of ['javascript:alert(1)','http://example.com','/relative','not a URL']){
  assert.equal(isHttpsUrl(url),false);
  assert.equal(guideSchema.safeParse({...valid,sources:[{...valid.sources[0],url}]}).success,false);
 }
 assert.ok(isHttpsUrl('https://example.com'));
});
test('video entries require exactly one valid ID',()=>{
 for(const entry of [{},{youtube:'abc',instagram:'def'},{youtube:''}])assert.equal(guideSchema.safeParse({...valid,videoIds:[entry]}).success,false);
 for(const entry of [{youtube:'abc'},{instagram:'def'}])assert.ok(guideSchema.safeParse({...valid,videoIds:[entry]}).success);
 const metadata=videoMetadata({youtube:'abc'});
 assert.ok(metadata.embedUrl);assert.equal(metadata.contentUrl,undefined);assert.equal(metadata.uploadDate,undefined);
 assert.equal(videoMetadata({instagram:'abc'},new Date('2026-11-04')).uploadDate,'2026-11-04T00:00:00.000Z');
 assert.ok(guideSchema.safeParse({...valid,videoUploadDate:'2026-11-04'}).success);
});
test('wording matches across inline tags and whitespace',()=>{
 for(const text of ['Proven <em>Results</em>','Proven\n\t Results','free&nbsp;AI   tools'])assert.ok(hasProhibitedWording(text));
 assert.equal(hasProhibitedWording('A useful guide'),false);
});
test('unpublished translation is optional and omitted outside preview',()=>{
 const guide={data:{lang:'en',translationOf:'sample'}};
 const draft={id:'ar/sample',data:{lang:'ar',draft:true}};
 assert.equal(findCounterpart(guide,[draft]),undefined);
 assert.equal(findCounterpart(guide,[]),undefined);
 assert.equal(findCounterpart(guide,[draft],true),draft);
 const published={...draft,data:{...draft.data,draft:false}};
 assert.equal(findCounterpart(guide,[published]),published);
});
