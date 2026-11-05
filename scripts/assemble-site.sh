#!/usr/bin/env bash
# Builds the publish folder _site/: the existing root pages, unchanged, plus the
# Guides Hub build (hub/dist) under /guides/. Run after "npm run build" in hub/.
# Fails closed if any URL registered with Meta or TikTok would be missing.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site

# Root pages served at https://jofooai.jofoo.tech/ (registered URLs: keep paths).
ROOT_FILES=(index.html privacy.html terms.html style.css logo.png CNAME .nojekyll robots.txt)
for f in "${ROOT_FILES[@]}"; do cp "$f" _site/; done
cp tiktok*.txt _site/
cp -R media _site/media

# Guides Hub.
test -f hub/dist/index.html || { echo "hub/dist missing: run npm run build in hub/ first" >&2; exit 1; }
cp -R hub/dist _site/guides
cp hub/dist/404.html _site/404.html

# Fail-closed checks.
REQUIRED=(index.html privacy.html terms.html robots.txt 404.html guides/index.html guides/ar/index.html guides/sitemap-index.xml)
for f in "${REQUIRED[@]}"; do test -s "_site/$f" || { echo "missing _site/$f" >&2; exit 1; }; done
ls _site/tiktok*.txt >/dev/null
# Intentionally changing a registered file requires regenerating the manifest with:
# sha256sum <files> > registered-files.sha256
(cd _site && sha256sum -c ../registered-files.sha256)
echo "assembled _site: $(find _site -type f | wc -l) files"
