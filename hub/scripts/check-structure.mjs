import {parse} from 'yaml';
import {pathToFileURL} from 'node:url';
import {files,read,fail} from './check-utils.mjs';

export function checkStructure(source) {
  const errors=[], warnings=[];
  const match=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  let data={};
  try { data=match?parse(match[1]):{}; } catch { errors.push('invalid frontmatter'); }
  if(!Array.isArray(data?.faq)||data.faq.length<2) errors.push('missing faq: at least 2 entries');
  // Examples and comments cannot satisfy the required visible structure.
  const body=source.slice(match?.[0].length??0).replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[^\n]*$/gm,'').replace(/\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->|(`+)[\s\S]*?\1/g,'');
  const tags=[...body.matchAll(/<(\/?)(TLDR|Problem|Why|Fix|StepByStep|Step|Prompt|Tip|Warning|Safety|Checklist)\b(?:"[^"]*"|'[^']*'|[^'">])*>/g)];
  const stack=[], elements=[];
  for(const tag of tags){
    if(!tag[1]) { if(!tag[0].endsWith('/>')) stack.push({name:tag[2],start:tag.index,end:tag.index+tag[0].length}); }
    else { const opening=stack.pop(); if(!opening||opening.name!==tag[2]) errors.push(`unbalanced ${tag[2]}`); else elements.push({...opening,close:tag.index,after:tag.index+tag[0].length}); }
  }
  for(const item of stack) errors.push(`unclosed ${item.name}`);
  let cursor=0;
  const sections={};
  for(const group of [['TLDR'],['Problem'],['Why'],['Fix'],['StepByStep'],['Checklist']]){
    const candidates=elements.filter(e=>group.includes(e.name)&&e.start>=cursor).sort((a,b)=>a.start-b.start);
    const item=candidates[0];
    if(!item){errors.push(`missing or out of order ${group.join('/')}`);continue;}
    if(item.name==='StepByStep'&&elements.filter(e=>e.name==='Step'&&e.start>=item.end&&e.after<=item.close).length<3) errors.push('missing StepByStep: at least 3 Step children');
    sections[item.name]=item;
    cursor=item.after;
  }
  for(const group of [['Prompt'],['Tip','Warning','Safety']]){
    if(!elements.some(e=>group.includes(e.name)&&e.start>=sections.Fix?.end&&e.after<=sections.Checklist?.start))errors.push(`missing or out of order ${group.join('/')}`);
  }
  if(data?.publishOn && Number.isFinite(Date.parse(data.publishOn))){
    const time=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Los_Angeles',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(data.publishOn));
    if(time!=='08:00:00'||new Date(data.publishOn).getUTCMilliseconds()!==0)warnings.push('publishOn is not 08:00 in America/Los_Angeles');
  }
  if(data?.lang==='en'){
    const prose=body.replace(/<[^>]*>/g,' ').replace(/\[[^\]]*\]\([^)]*\)/g,' ').replace(/[#*_{}]/g,' ');
    const sentences=prose.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
    const words=sentences.reduce((n,s)=>n+(s.match(/\b[\w]+(?:['’-][\w]+)*\b/g)?.length??0),0);
    const average=sentences.length?words/sentences.length:0;
    if(average>20)warnings.push(`English readability: average sentence length ${average.toFixed(1)} words exceeds 20`);
  }
  return {errors,warnings};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const errors=[];
  for(const file of (await files('src/content/guides')).filter(f=>/\.mdx?$/.test(f))){
    const result=checkStructure(await read(file));
    errors.push(...result.errors.map(e=>`${file}: ${e}`));
    for(const warning of result.warnings)console.warn(`${file}: ${warning}`);
  }
  fail(errors);
}
