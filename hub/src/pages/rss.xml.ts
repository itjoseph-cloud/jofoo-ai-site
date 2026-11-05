import rss from '@astrojs/rss';
import {guides,slug} from '../lib/guides';
import {path,absolute} from '../i18n/ui';
export async function GET(){return rss({title:'Jofoo AI',description:'Practical AI guides for everyday tasks.',site:absolute(path('en')),items:(await guides('en')).map(g=>({title:g.data.title,description:g.data.description,pubDate:g.data.verifiedOn,link:absolute(path('en',`guides/${slug(g)}`))}))});}
