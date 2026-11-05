import rss from '@astrojs/rss';
import {guides,slug} from '../../lib/guides';
import {path,absolute} from '../../i18n/ui';
export async function GET(){return rss({title:'Jofoo AI',description:'أدلة عملية للذكاء الاصطناعي في المهام اليومية.',site:absolute(path('ar')),items:(await guides('ar')).map(g=>({title:g.data.title,description:g.data.description,pubDate:g.data.verifiedOn,link:absolute(path('ar',`guides/${slug(g)}`))}))});}
