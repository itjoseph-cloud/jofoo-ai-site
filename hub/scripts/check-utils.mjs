import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
export async function files(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(p));else result.push(p);}return result;}
export async function htmlFiles(){return (await files('dist')).filter(p=>p.endsWith('.html'));}
export const read=p=>readFile(p,'utf8');
export function target(url){const u=new URL(url,'https://jofoo.tech/jofooai/');if(u.origin!=='https://jofoo.tech')return null;if(!u.pathname.startsWith('/jofooai/'))throw new Error(`Internal URL outside base: ${url}`);const relative=decodeURIComponent(u.pathname.slice('/jofooai/'.length));if(relative==='404/')return 'dist/404.html';return path.join('dist',relative.endsWith('/')||!path.extname(relative)?relative+'index.html':relative);}
export async function exists(p){try{return (await stat(p)).isFile();}catch{return false;}}
export function fail(errors){if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Check passed');}
