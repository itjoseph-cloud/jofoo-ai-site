import {pathToFileURL} from 'node:url';
import {files,htmlFiles,read,fail} from './check-utils.mjs';
const patterns=[['free','AI','tools'].join('\\s+'),['tes','ted'].join(''),['Proven','Results'].join('\\s+')];
export function hasProhibitedWording(input){
 const text=input.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
 return patterns.some(phrase=>new RegExp(`\\b${phrase}\\b`,'i').test(text));
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 const errors=[];
 for(const file of [...(await files('src')).filter(f=>/\.(astro|mdx|ts|mjs|css)$/.test(f)),...await htmlFiles()])if(hasProhibitedWording(await read(file)))errors.push(`${file}: prohibited wording`);
 fail(errors);
}
