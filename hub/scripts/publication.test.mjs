import test from 'node:test';
import assert from 'node:assert/strict';
import {isPublished} from '../src/lib/publication.mjs';
import {guideSchema} from '../src/lib/guide-schema.mjs';
test('publication gates tomorrow, includes exact boundary, honors offsets and preview',()=>{
 const previous=process.env.INCLUDE_DRAFTS;
 try {
  delete process.env.INCLUDE_DRAFTS;
  const now=new Date('2026-11-05T16:00:00Z');
  const tomorrow={data:{draft:false,publishOn:'2026-11-06T08:00:00-08:00'}};
  assert.equal(isPublished(tomorrow,now),false);
  assert.equal(isPublished(tomorrow,new Date('2026-11-06T16:00:00Z')),true);
  assert.equal(isPublished({data:{draft:false}},now),true);
  assert.equal(isPublished({data:{draft:true}},now),false);
  assert.equal(isPublished({data:{publishOn:'invalid'}},now),false);
  process.env.INCLUDE_DRAFTS='1';
  assert.equal(isPublished(tomorrow,now),true);
  assert.equal(isPublished({data:{draft:true}},now),true);
 } finally {if(previous===undefined)delete process.env.INCLUDE_DRAFTS;else process.env.INCLUDE_DRAFTS=previous;}
});
test('graphic and publication schema constraints',()=>{
 const shape=guideSchema.shape;
 assert.equal(shape.icon.safeParse('unknown').success,false);
 assert.equal(shape.icon.safeParse('chat').success,true);
 for(const value of ['2026-11-06','2026-11-06T08:00:00','invalid'])assert.equal(shape.publishOn.safeParse(value).success,false);
 assert.equal(shape.publishOn.safeParse('2026-11-06T08:00:00-08:00').success,true);
 const item={label:'Goal',detail:'Choose a task.'};
 for(const length of [2,7])assert.equal(shape.infographic.safeParse({title:'Flow',items:Array(length).fill(item)}).success,false);
 for(const length of [3,6])assert.equal(shape.infographic.safeParse({title:'Flow',items:Array(length).fill(item)}).success,true);
 for(const item of [{label:'x'.repeat(41),detail:'ok'},{label:'ok',detail:'x'.repeat(91)}])assert.equal(shape.infographic.safeParse({title:'Flow',items:Array(3).fill(item)}).success,false);
});

import {publicationDates,comparePublication} from '../src/lib/publication.mjs';
test('offset timestamps accept minute or second precision and reject malformed dates',()=>{
 for(const value of ['2026-11-06T08:00-08:00','2026-11-06T08:00:00-08:00','2026-07-06T08:00+02:00'])assert.ok(guideSchema.shape.publishOn.safeParse(value).success,value);
 for(const value of ['2026-11-06T08:00','2026-11-06T25:00-08:00','2026-02-30T08:00-08:00'])assert.equal(guideSchema.shape.publishOn.safeParse(value).success,false,value);
});
test('publication and modification dates have independent precedence and sort ignores updates',()=>{
 const data={verifiedOn:new Date('2026-11-01'),publishOn:'2026-11-06T08:00-08:00',updatedOn:new Date('2026-11-07')};
 assert.equal(publicationDates(data).published.toISOString(),'2026-11-06T16:00:00.000Z');
 assert.equal(publicationDates(data).modified.toISOString(),'2026-11-07T00:00:00.000Z');
 assert.equal(publicationDates({...data,updatedOn:undefined}).modified.toISOString(),'2026-11-06T16:00:00.000Z');
 assert.equal(publicationDates({verifiedOn:data.verifiedOn}).published.toISOString(),data.verifiedOn.toISOString());
 assert.equal(publicationDates({verifiedOn:data.verifiedOn}).modified.toISOString(),data.verifiedOn.toISOString());
 const old={data:{verifiedOn:new Date('2026-10-01'),updatedOn:new Date('2027-01-01')}};
 assert.deepEqual([old,{data}].sort(comparePublication),[{data},old]);
});
