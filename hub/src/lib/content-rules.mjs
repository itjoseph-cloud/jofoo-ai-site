/** @param {string} value */
export function isHttpsUrl(value) {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}
/** @param {{data: {lang: string, translationOf?: string}}} guide
 * @param {Array<{id: string, data: {lang: string, draft: boolean}}>} items
 * @param {boolean} preview */
export function findCounterpart(guide, items, preview = false) {
  return items.find(g => g.data.lang !== guide.data.lang &&
    g.id.split('/').pop() === guide.data.translationOf && (!g.data.draft || preview));
}
/** @param {{youtube?: string, instagram?: string}} video
 * @param {Date | undefined} uploadDate */
export function videoMetadata(video, uploadDate) {
  return {
    url: video.youtube ? `https://www.youtube.com/watch?v=${video.youtube}` : `https://www.instagram.com/p/${video.instagram}/`,
    ...(video.youtube ? {embedUrl: `https://www.youtube.com/embed/${video.youtube}`} : {}),
    ...(uploadDate ? {uploadDate: uploadDate.toISOString()} : {}),
  };
}
