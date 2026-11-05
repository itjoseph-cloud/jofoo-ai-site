/** @param {{data:{draft?:boolean,publishOn?:string}}} guide @param {Date} now */
export function isPublished(guide, now = new Date()) {
  if (process.env.INCLUDE_DRAFTS === '1') return true;
  return !guide.data.draft && (!guide.data.publishOn || Date.parse(guide.data.publishOn) <= now.valueOf());
}

/** @param {{publishOn?:string,verifiedOn:Date|string,updatedOn?:Date|string}} data */
export function publicationDates(data) {
  return {
    published: new Date(data.publishOn ?? data.verifiedOn),
    modified: new Date(data.updatedOn ?? data.publishOn ?? data.verifiedOn),
  };
}

/** Newest publication first; corrections do not change publication order. */
export function comparePublication(a, b) {
  return publicationDates(b.data).published.valueOf() - publicationDates(a.data).published.valueOf();
}
