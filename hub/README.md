# Jofoo AI Guides Hub

Static bilingual Astro site served at https://jofoo.tech/jofooai/.

The search build runs `pagefind --site dist` when guide bodies exist. Pagefind exits with an error on an empty corpus, so the wrapper writes a local no-results module when there are no published guides. Non-guide pages never enter the index.

## Local Commands

- `npm run dev` starts the local development server.
- `npm run verify` checks types, builds with the draft example, and validates wording, language links, structured data, and local links.
- `npm run build` generates production output and the Pagefind index. Drafts are excluded.
- `npm run build:preview` includes drafts for component and schema review.
- `npm test` checks internal-link resolution boundaries.
- `node scripts/check-acceptance.mjs preview` checks the sample pages after a preview build; use `production` after a normal build.

## Content

Write guides in `src/content/guides/en/` and `src/content/guides/ar/`. Use the draft sample as the schema reference. Pair translations using reciprocal `translationOf` slugs. Keep each translation's content ID the same. The schema requires a QA approval record for medium and high risk content. Review dates in the sample are fixture values, not a publication claim.

Use the supplied MDX components. Prompt library extraction supports literal `<Prompt label="Label">text</Prompt>` blocks; keep prompt contents plain text. The second H2 receives a prompt-pack newsletter block during compilation. All runtime assets are local; video facades link to the provider without loading remote thumbnails.

Fonts and brand assets live in `public/`. All colors and spacing use `src/styles/brand-tokens.css`. English and Arabic share templates, with logical layout properties and local Arabic fonts.

Newsletter forms are disabled unless `PUBLIC_MAILERLITE_FORM_ACTION` is provided to the build environment. Use an HTTPS MailerLite action on assets.mailerlite.com or static.mailerlite.com. Configure its success redirect to the matching `/jofooai/newsletter/thanks/` or `/jofooai/ar/newsletter/thanks/` page in MailerLite. No credentials are needed for a static build.

## Deployment

Pull requests run verification. Main pushes and manual dispatches verify and then rebuild without drafts before uploading to GitHub Pages. Configure the repository to deploy Pages with GitHub Actions. No custom-domain file is included.
