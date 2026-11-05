# Jofoo AI Guides Hub: site build spec (v1)

Public URL: `https://jofoo.tech/jofooai/`. GitHub Pages project site, no CNAME file. Astro `site: 'https://jofoo.tech'`, `base: '/jofooai'`, `trailingSlash: 'always'`, `output: 'static'`.

## Rules
- All copy is original. No text, layout or images from any other site.
- Never write the phrases "free AI tools", "tested" (unless a test record exists) or "Proven Results". No emoji in UI copy. Headlines in Title Case. Write "Jofoo AI" with a space.
- No invented numbers. Show counts only when computed from real content (for example, the guide count).
- No external requests at runtime except the MailerLite form, which loads only when `PUBLIC_MAILERLITE_FORM_ACTION` is set at build time. With no value set, show a disabled "Newsletter opening soon" block. No analytics scripts, no Google Fonts.
- Fonts come only from `/public/fonts` (Sora for headings, DM Sans for body, JetBrains Mono for code, IBM Plex Sans Arabic for `lang="ar"`). Colours and spacing come from `src/styles/brand-tokens.css`. Dark ocean theme by default.
- Accessible: semantic HTML, visible focus, contrast AA or better, works with keyboard only, respects `prefers-reduced-motion`.
- Fast: zero client JS on content pages except small islands for the copy button, the search box and the language switcher.

## Languages
- English at `/jofooai/...` and Arabic at `/jofooai/ar/...`, using Astro i18n (`defaultLocale: 'en'`, `locales: ['en','ar']`, `prefixDefaultLocale: false`).
- Arabic pages set `<html lang="ar" dir="rtl">` and use CSS logical properties throughout, so the layout mirrors.
- Every page outputs `<link rel="alternate" hreflang="en|ar|x-default">` for the pair that exists, plus a self-referencing canonical.
- UI strings live in `src/i18n/ui.ts` (en and ar). Arabic register is Modern Standard Arabic.

## Content collection `guides` (`src/content/guides/{en,ar}/<slug>.mdx`)
Zod schema in `src/content.config.ts`. The build fails if any of these are missing or wrong:
`contentId` (regex `^JAI-\d{8}-\d{3}$`), `lang` ('en'|'ar'), `translationOf` (slug of the other language, optional), `title` (≤ 70 chars), `description` (120 to 160 chars), `promise`, `pillar` (enum: fix-it, save-time, tools, in-a-minute, create, safety), `segment` (enum: beginners, students, professionals, older-adults, creators), `level` (beginner|intermediate|advanced), `tools` (string[] ≥ 1), `cost` (string, for example "$0 on the free plan"), `timeMinutes` (int), `verifiedOn` (date), `updatedOn` (date, optional), `sources` (array ≥ 1 of {title, url, accessed: date}), `riskLevel` (LOW|MEDIUM|HIGH), `qaRecord` (string), `primaryKeyword`, `secondaryKeywords` (string[]), `faq` (array of {q, a}), `videoIds` ({youtube?, instagram?}[], optional), `draft` (boolean, default false).
- Pages are only built for `draft: false`.
- **Build guard:** any guide with `riskLevel` other than LOW must have `qaRecord` matching `^QA-APPROVED-JAI-\d{8}-\d{3}-\d{8}$`.

Put **one** sample guide in `src/content/guides/{en,ar}/sample-guide.mdx` with `draft: true`, so no page is generated for it. It exists only to exercise the schema and components in a test build: `npm run build:preview` sets `INCLUDE_DRAFTS=1`.

## MDX components (`src/components/guide/`)
- `Prompt` is a copy-ready code block with a label and a Copy button. It shows a "Copied" confirmation, has an aria-live region, and works without JS (text stays selectable).
- `Steps` and `Step` render numbered steps.
- `Tip`, `Warning` and `Safety` are callouts with icon and label, and work in RTL.
- `Shot` is a figure with a required `alt` and caption, and an optional `source` credit. Images are lazy-loaded with width and height set.
- `Checklist` is the final checklist.
- `TLDR` is an answer-first summary box at the top.

## Guide page layout
In order:
1. Breadcrumbs
2. H1 (title)
3. Promise line
4. Meta strip: "Verified on {date}", cost, time, level, tools
5. TLDR (from the MDX body)
6. MDX body
7. FAQ (rendered from frontmatter, as `<details>`)
8. Sources list with accessed dates
9. Disclosure line: "Jofoo AI is independent and not affiliated with the tool makers named here. Some steps were drafted with AI help and checked by a person." (Arabic equivalent in ui.ts.)
10. Video embed slot (facade: thumbnail plus link, no iframe until click) when `videoIds` is set
11. Mid-page CTA after the second H2: prompt-pack sign-up
12. End CTA: newsletter
13. Related guides: 3, same pillar first
14. Back to hub

## Other pages (both languages)
- **Hub `/`:**
  - Hero H1 "What Do You Want to Fix With AI?"
  - Pagefind search box
  - Quick chips: top 6 primaryKeywords by most recent
  - Pillar filter buttons (client-side filter, URL `?pillar=`)
  - Grid of guide cards (title, description, pillar, time)
  - The real guide count
  - Newsletter block and follow links (YouTube https://www.youtube.com/@jofooai, Instagram https://www.instagram.com/jofooai)
  - Empty state when there are no guides yet: "First guides are on the way. Get them by email."
- **`/topics/<pillar>/`:** cluster hub with an intro paragraph from `src/data/pillars.ts` (en and ar) and the guides in that pillar.
- **`/prompts/`:** every `Prompt` from published guides, collected at build time and linked to its guide.
- **`/newsletter/`** and **`/newsletter/thanks/`.**
- **`/links/`:** link-in-bio page with large buttons: latest 5 guides, newsletter, YouTube, Instagram.
- **`/about/`** and **`/editorial-policy/`:** how guides are researched, verified, dated and corrected, the AI-assistance disclosure, and the risk levels. Draft copy is fine; keep it factual.
- **Privacy and terms:** footer links go to `https://jofooai.jofoo.tech/privacy.html` and `/terms.html`.
- **404 page.**

## SEO output
- `<title>`, meta description, canonical, Open Graph and Twitter tags.
- OG image: `public/og-default.png` at 1200×630, built from the logo on a solid ocean background (a committed static file is fine).
- JSON-LD:
  - Organization and WebSite (with SearchAction pointing at `/jofooai/?q={search_term_string}`) on the hub.
  - Article (headline, datePublished = verifiedOn, dateModified = updatedOn or verifiedOn, inLanguage, author = Organization "Jofoo AI"), BreadcrumbList, and FAQPage (when faq is non-empty) on guides.
  - VideoObject when videoIds is present.
- `@astrojs/sitemap` with i18n alternates. `robots.txt` allows all and links the sitemap. RSS at `/rss.xml` and `/ar/rss.xml`. `llms.txt` lists the hub, topics and guides with one-line descriptions.

## Search
Pagefind runs after `astro build` (`pagefind --site dist`). Index only guide bodies (`data-pagefind-body`), with filters for pillar and language. The hub search reads `?q=`.

## Scripts and checks (package.json)
- `dev`, `build` (`astro build && pagefind --site dist`), `build:preview` (same with `INCLUDE_DRAFTS=1`, via cross-platform node script, no new dependency), `check` (`astro check`), `test` (`node --test scripts/`).
- `scripts/check-wording.mjs`: fails on banned phrases in `src/` and `dist/` HTML text.
- `scripts/check-hreflang.mjs`: every page with `translationOf` has its pair, and the hreflang links resolve to built files.
- `scripts/check-jsonld.mjs`: every JSON-LD block parses and has `@context` and `@type`.
- `scripts/check-links.mjs`: internal links in `dist` resolve to files. External links are only listed.
- `npm run verify` runs check, build:preview, then the 4 check scripts against `dist`.

## Deploy
`.github/workflows/deploy.yml` uses actions/checkout, setup-node (node 22), `npm ci`, `npm run verify`, `npm run build`, upload-pages-artifact and deploy-pages. It triggers on push to `main` and on workflow_dispatch. Pin actions to major versions. `.github/workflows/ci.yml` runs `npm run verify` on pull requests.

## Acceptance
`npm run verify` exits 0.
- After `build:preview`: `dist/guides/sample-guide/index.html` and `dist/ar/guides/sample-guide/index.html` exist, and they contain hreflang, canonical, Article JSON-LD and `dir="rtl"` (Arabic).
- After a plain `npm run build`: the sample guide is not present, the hub shows the empty state, and `dist/pagefind/` exists.

## Review corrections
- Published guides require `^QA-(APPROVED-)?JAI-\d{8}-\d{3}-\d{8}$`; LOW-risk drafts may use PENDING. Elevated-risk approval remains mandatory for drafts.
- Source URLs and Shot credits require HTTPS. Each video entry requires exactly one provider ID. Optional `videoUploadDate` supplies VideoObject uploadDate; otherwise it is omitted. Video metadata uses url/embedUrl.
- Hreflang is emitted only for available translation pairs (draft pairs are available in preview). An unpublished counterpart does not block publication.
- The 404 and both newsletter thank-you pages are noindex and excluded from the sitemap. The 404 omits canonical and hreflang.
- Breadcrumbs have localized labels and a current-page item; Arabic uses the Arabic body font. Empty hubs omit the count line.
- Wording checks normalize markup whitespace. Verify includes preview acceptance; deploy checks production acceptance after building.
