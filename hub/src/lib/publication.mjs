/** @param {{data:{draft?:boolean,publishOn?:string}}} guide @param {Date} now */
export function isPublished(guide, now = new Date()) {
  if (process.env.INCLUDE_DRAFTS === '1') return true;
  return !guide.data.draft && (!guide.data.publishOn || Date.parse(guide.data.publishOn) <= now.valueOf());
}
