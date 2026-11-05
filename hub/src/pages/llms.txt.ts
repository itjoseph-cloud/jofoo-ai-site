import {guides,slug} from '../lib/guides';
import {path,absolute,ui} from '../i18n/ui';
import {pillars} from '../data/pillars';
export async function GET(){const lines=['# Jofoo AI'];for(const lang of ['en','ar'] as const){lines.push(`- [${ui[lang].home}](${absolute(path(lang))}): ${ui[lang].intro}`);for(const [key,p] of Object.entries(pillars))lines.push(`- [${p[lang][0]}](${absolute(path(lang,`topics/${key}`))}): ${p[lang][1]}`);for(const g of await guides(lang))lines.push(`- [${g.data.title}](${absolute(path(lang,`guides/${slug(g)}`))}): ${g.data.description}`);}return new Response(lines.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
