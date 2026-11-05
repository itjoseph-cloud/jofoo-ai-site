import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { guideSchema } from './lib/guide-schema.mjs';
const guides = defineCollection({ loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }), schema: guideSchema });
export const collections = { guides };
