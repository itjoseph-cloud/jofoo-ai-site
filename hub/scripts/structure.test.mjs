import test from 'node:test';
import assert from 'node:assert/strict';
import {checkStructure} from './check-structure.mjs';
const valid=`---
lang: en
faq: [{q: One, a: Yes}, {q: Two, a: Yes}]
---
<TLDR>Start here.</TLDR><Problem>A problem.</Problem><Why>A reason.</Why><Fix>A solution.</Fix><StepByStep><Step>One.</Step><Step>Two.</Step><Step>Three.</Step></StepByStep><Prompt>Write.</Prompt><Tip>Check.</Tip><Checklist><li>Done.</li></Checklist>`;
test('complete guide structure passes and each required section is enforced',()=>{
 assert.deepEqual(checkStructure(valid).errors,[]);
 for(const name of ['TLDR','Problem','Why','Fix','StepByStep','Prompt','Tip','Checklist'])assert.ok(checkStructure(valid.replace(new RegExp(`<${name}[^>]*>[\\s\\S]*?</${name}>`),'')).errors.some(e=>e.includes(name)));
});
test('order, nested steps, FAQ count and ignored examples',()=>{
 assert.ok(checkStructure(valid.replace('<Why>A reason.</Why>','').replace('<Problem>','<Why>A reason.</Why><Problem>')).errors.some(e=>e.includes('Why')));
 assert.ok(checkStructure(valid.replace('<Step>Three.</Step>','')).errors.some(e=>e.includes('3 Step')));
 assert.ok(checkStructure(valid.replace('<Step>Three.</Step>','').replace('<Prompt>','<Step>Three.</Step><Prompt>')).errors.some(e=>e.includes('3 Step')));
 assert.ok(checkStructure(valid.replace(', {q: Two, a: Yes}','')).errors.some(e=>e.includes('faq')));
 for(const wrapper of [s=>'\n```mdx\n'+s+'\n```\n',s=>`{/* ${s} */}`,s=>`<!-- ${s} -->`])assert.ok(checkStructure(valid.replace('<Problem>A problem.</Problem>',wrapper('<Problem>A problem.</Problem>'))).errors.some(e=>e.includes('Problem')));
});
test('readability only warns for English prose over the limit',()=>{
 const long=valid.replace('Start here.',('word '.repeat(300))+'.');
 assert.equal(checkStructure(long).errors.length,0);
 assert.equal(checkStructure(long).warnings.length,1);
 assert.equal(checkStructure(long.replace('lang: en','lang: ar')).warnings.length,0);
});

test('nested prompts and callouts are allowed between Fix and Checklist',()=>{
 for(const kind of ['Tip','Warning','Safety']){
  const nested=valid.replace('<Tip>Check.</Tip>','').replace('<Fix>A solution.</Fix>',`<Fix>A solution.<${kind}>Check.</${kind}></Fix>`).replace('<Prompt>Write.</Prompt>','').replace('<Step>One.</Step>','<Step>One.<Prompt>Write.</Prompt></Step>');
  assert.deepEqual(checkStructure(nested).errors,[]);
 }
 for(const tag of ['Prompt','Tip']){
  const block=tag==='Prompt'?'<Prompt>Write.</Prompt>':'<Tip>Check.</Tip>';
  for(const misplaced of [valid.replace(block,'').replace('<Fix>',block+'<Fix>'),valid.replace(block,'')+block])assert.ok(checkStructure(misplaced).errors.some(e=>e.includes(tag)));
 }
});
test('indented fences and double-backtick inline examples cannot satisfy structure',()=>{
 for(const wrap of [s=>'\n  ```mdx\n'+s+'\n  ```\n',s=>'\n    ~~~mdx\n'+s+'\n    ~~~\n',s=>'``example ` '+s+' ` example``']){
  assert.ok(checkStructure(valid.replace('<Problem>A problem.</Problem>',wrap('<Problem>A problem.</Problem>'))).errors.some(e=>e.includes('Problem')));
 }
});
test('quoted greater-than and component-looking attribute text are not tags',()=>{
 for(const quote of ['"',"'"])assert.deepEqual(checkStructure(valid.replace('<Problem>',`<Problem label=${quote}a > <Fix> b${quote}>`)).errors,[]);
});
test('Pacific publication time warns without failing, including daylight saving',()=>{
 for(const [value,warns] of [['2026-11-06T08:00-08:00',false],['2026-07-06T08:00:00-07:00',false],['2026-11-06T16:00Z',false],['2026-07-06T08:00-08:00',true],['2026-11-06T08:01-08:00',true],['2026-11-06T08:00:01-08:00',true]]){
  const result=checkStructure(valid.replace('lang: en',`lang: en\npublishOn: ${value}`));
  assert.deepEqual(result.errors,[]);assert.equal(result.warnings.some(w=>w.includes('publishOn')),warns,value);
 }
});
