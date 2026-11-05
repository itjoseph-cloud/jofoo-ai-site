import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {htmlFiles,read} from './check-utils.mjs';
const pages=await htmlFiles();
const hasGuides=(await Promise.all(pages.map(read))).some(html=>html.includes('data-pagefind-filter='));
if(hasGuides){
 const result=process.platform==='win32'
   ? spawnSync('cmd.exe',['/d','/s','/c','pagefind --site dist'],{stdio:'inherit'})
   : spawnSync('pagefind',['--site','dist'],{stdio:'inherit'});
 process.exitCode=result.status??1;
}else{
 // Pagefind exits with an error for zero pages. Preserve its client interface
 // without indexing navigation, empty states, or other non-guide content.
 await mkdir('dist/pagefind',{recursive:true});
 await writeFile('dist/pagefind/pagefind.js','export async function options() {}\nexport async function search() { return { results: [] }; }\nexport async function filters() { return {}; }\n');
 console.log('No published guides: wrote an empty local search module.');
}
