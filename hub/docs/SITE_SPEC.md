# Jofoo AI Guides Hub: site build spec (v1)

Public URL: `https://jofooai.jofoo.tech/guides/`. Served from repo `jofoo-ai-site` with root CNAME `jofooai.jofoo.tech`. Astro `site: 'https://jofooai.jofoo.tech'`, `base: '/guides'`, `trailingSlash: 'always'`, `output: 'static'`.

## Rules
- All copy is original. No text, layout or images from any other site.
- Never write the phrases "free AI tools", "tested" (unless a test record exists) or "Proven Results". No emoji in UI copy. Headlines in Title Case. Write "Jofoo AI" with a space.
- No invented numbers. Show counts only when computed from real content (for example, the guide count).
- No external requests at runtime except the MailerLite form, which loads only when `PUBLIC_MAILERLITE_FORM_ACTION` is set at build time. With no value set, show a disabled "Newsletter opening soon" block. No analytics scripts, no Google Fonts.
- Fonts come only from `/public/fonts` (Sora for headings, DM Sans for body, JetBrains Mono for code, IBM Plex Sans Arabic for `lang="ar"`). Colours and spacing come from `src/styles/brand-tokens.css`. Dark ocean theme by default.
- Accessible: semantic HTML, visible focus, contrast AA or better, works with keyboard only, respects `prefers-reduced-motion`.
- Fast: zero client JS on content pages except small islands for the copy button, the search box and the language switcher.

## Languages
- English at `/guides/...` and Arabic at `/guides/ar/...`, using Astro i18n (`defaultLocale: 'en'`, `locales: ['en','ar']`, `prefixDefaultLocale: false`).
- Arabic pages set `<html lang="ar" dir="rtl">` and use CSS logical properties throughout, so the layout mirrors.
- Every page outputs `<link rel="alternate" hreflang="en|ar|x-default">` for the pair that exists, plus a self-referencing canonical.
- UI strings live in `src/i18n/ui.ts` (en and ar). Arabic register is Modern Standard Arabic.

## Content collection `guides` (`src/content/guides/{en,ar}/<slug>.mdx`)
Zod schema in `src/content.config.ts`. The build fails if any of these are missing or wrong:
`contentId` (regex `^JAI-\d{8}-\d{3}$`), `lang` ('en'|'ar'), `translationOf` (slug of the other language, optional), `title` (≤ 70 chars), `description` (120 to 160 chars), `promise`, `pillar` (enum: fix-it, save-time, tools, in-a-minute, create, safety, prompt-packs), `segment` (enum: beginners, students, professionals, older-adults, creators), `level` (beginner|intermediate|advanced), `tools` (string[] ≥ 1), `cost` (string, for example "$0 on the free plan"), `timeMinutes` (int), `verifiedOn` (date), `updatedOn` (date, optional), `sources` (array ≥ 1 of {title, url, accessed: date}), `riskLevel` (LOW|MEDIUM|HIGH), `qaRecord` (string), `primaryKeyword`, `secondaryKeywords` (string[]), `faq` (array of {q, a}), `videoIds` ({youtube?, instagram?}[], optional), `draft` (boolean, default false).
- Pages are built only when `isPublished(guide, now)` permits them: draft is false and publishOn is absent or at/before build time. `INCLUDE_DRAFTS=1` includes both drafts and future guides in preview. All routes, related guides, prompts, RSS, sitemap, search and llms.txt share this gate.
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
Guide URLs: `/guides/<slug>/` and `/guides/ar/<slug>/`.
In order:
1. Breadcrumbs
2. Coded Cover banner, then H1 (title)
3. Promise line
4. Meta strip: "Verified on {date}", cost, time, level, tools
5. TLDR (from the MDX body)
6. Infographic figure, then the structured MDX body
7. FAQ (rendered from frontmatter, as `<details>`)
8. Sources list with accessed dates
9. Disclosure line: "Jofoo AI is independent and not affiliated with the tool makers named here. Some steps were drafted with AI help and checked by a person." (Arabic equivalent in ui.ts.)
10. Video embed slot (facade: thumbnail plus link, no iframe until click) when `videoIds` is set
11. Mid-page CTA after the second H2: prompt-pack sign-up
12. End CTA: newsletter
13. Related guides: 3, same pillar first
14. Back to hub

## Other pages (both languages)
Routes below are relative to `/guides/` (English) or `/guides/ar/` (Arabic).
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
- **`/prompts/`:** every `Prompt` from published guides, collected at build time and linked to its guide, with prompt-packs guides first and a link to that topic.
- **`/newsletter/`** and **`/newsletter/thanks/`.**
- **`/links/`:** link-in-bio page with large buttons: latest 5 guides, newsletter, YouTube, Instagram.
- **`/about/`** and **`/editorial-policy/`:** how guides are researched, verified, dated and corrected, the AI-assistance disclosure, and the risk levels. Draft copy is fine; keep it factual.
- **Privacy and terms:** footer links go to `https://jofooai.jofoo.tech/privacy.html` and `/terms.html`.
- **404 page.**

## SEO output
- `<title>`, meta description, canonical, Open Graph and Twitter tags.
- OG image: `public/og-default.png` at 1200×630, built from the logo on a solid ocean background (a committed static file is fine).
- JSON-LD:
  - Organization and WebSite (with SearchAction pointing at `/guides/?q={search_term_string}`) on the hub.
  - Article (headline, datePublished = verifiedOn, dateModified = updatedOn or verifiedOn, inLanguage, author = Organization "Jofoo AI"), BreadcrumbList, and FAQPage (when faq is non-empty) on guides.
  - VideoObject when videoIds is present.
- `@astrojs/sitemap` with i18n alternates. `robots.txt` is served at the domain root by the deploy job. RSS at `/guides/rss.xml` and `/guides/ar/rss.xml`. `llms.txt` lists the hub, topics and guides with one-line descriptions.

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
- After `build:preview`: `dist/sample-guide/index.html` and `dist/ar/sample-guide/index.html` exist, and they contain hreflang, canonical, Article JSON-LD and `dir="rtl"` (Arabic).
- After a plain `npm run build`: the sample guide is not present, the hub shows the empty state, and `dist/pagefind/` exists.

## Review corrections
- Published guides require `^QA-(APPROVED-)?JAI-\d{8}-\d{3}-\d{8}$`; LOW-risk drafts may use PENDING. Elevated-risk approval remains mandatory for drafts.
- Source URLs and Shot credits require HTTPS. Each video entry requires exactly one provider ID. Optional `videoUploadDate` supplies VideoObject uploadDate; otherwise it is omitted. Video metadata uses url/embedUrl.
- Hreflang is emitted only for available translation pairs (draft pairs are available in preview). An unpublished counterpart does not block publication.
- The 404 and both newsletter thank-you pages are noindex and excluded from the sitemap. The 404 omits canonical and hreflang.
- Breadcrumbs have localized labels and a current-page item; Arabic uses the Arabic body font. Empty hubs omit the count line.
- Wording checks normalize markup whitespace. Verify includes preview acceptance; deploy checks production acceptance after building.

## Enforced guide structure and graphics

The seventh pillar is `prompt-packs`, with localized labels and introductions in `src/data/pillars.ts`. It appears in filters, topic pages, llms.txt and the prompt library.

Every guide body must use this order: `TLDR`, `Problem`, `Why`, `Fix`, `StepByStep` containing at least three `Step` elements, at least one `Prompt`, at least one `Tip`/`Warning`/`Safety`, then `Checklist`. Frontmatter `faq` requires at least two entries. The four section components render localized H2s through `Heading.astro`; Markdown and page section H2s use that same counter. The compact CTA appears immediately after the second H2. `StepByStep` wraps the existing `Steps` ordered list.

Required frontmatter: `icon` is one of the 20 names in `src/data/glyphs.ts`; `infographic` contains a nonempty `title` and 3 to 6 `items`, each with `label` (1 to 40 characters) and `detail` (1 to 90 characters). Optional `publishOn` is an ISO datetime string with a timezone offset, for example `2026-11-06T08:00:00-08:00`.

`Cover.astro` renders the pillar label and an original decorative 24x24 stroke SVG on a brand gradient, above each guide title and as a card thumbnail. The H1 remains HTML. `Infographic.astro` follows TLDR automatically using frontmatter, with a figcaption and an ordered list of numbered HTML labels and details. It flows horizontally on wide screens and vertically on narrow screens, follows RTL direction and uses only brand tokens. Graphics require no external requests or animation.

`npm run verify` begins with `scripts/check-structure.mjs`. Missing or out-of-order components and insufficient FAQ entries fail with the file and part. English average sentence length above 20 words produces a warning only. Node unit cases cover structure, schema constraints and publication dates including a guide scheduled tomorrow. Preview acceptance checks the cover, infographic ordered list, localized H2s and CTA position.

Scheduled deploys run at UTC 15:00 and 16:00; a gate runs `TZ=America/Los_Angeles date +%H` and sets a step output. All subsequent steps run only if the hour is 08 for schedule events. Other scheduled runs finish successfully without deployment. Push and manual events always pass the gate.
