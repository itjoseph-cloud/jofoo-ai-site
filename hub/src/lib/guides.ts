import {isPublished,comparePublication} from './publication.mjs';
export {isPublished} from './publication.mjs';
const buildTime = new Date();
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
export type Guide = CollectionEntry<'guides'>;
export const slug = (g:Guide) => g.id.split('/').pop()!;
export async function guides(lang?:Lang) { return (await getCollection('guides')).filter(g => isPublished(g, buildTime) && (!lang || g.data.lang === lang)).sort(comparePublication); }
export const date = (value:Date, lang:Lang) => new Intl.DateTimeFormat(lang, {dateStyle:'medium',timeZone:'UTC'}).format(value);
export function extractPrompts(body:string) { return [...body.matchAll(/<Prompt(?:\s+label="([^"]*)")?\s*>([\s\S]*?)<\/Prompt>/g)].map(m=>({label:m[1],text:m[2].trim()})); }
