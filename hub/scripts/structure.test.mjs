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
