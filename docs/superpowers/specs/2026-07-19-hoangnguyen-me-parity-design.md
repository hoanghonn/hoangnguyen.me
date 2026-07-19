# hoangnguyen.me — Design Parity, Missing Pages & Blog CMS

**Date:** 2026-07-19
**Status:** Approved (pending spec review)

## Goal

Bring the existing Astro rebuild of `hoangnguyen.me` to visual + structural parity
with the live Wix site, fill in the two missing pages, align URLs, and add a
Markdown-based CMS (Keystatic) so the owner can write and publish blog posts
without touching code.

Out of scope for this session: deploying/hosting the site.

## Current State (verified via side-by-side screenshots)

The rebuild already matches the live site closely: dark `#222` theme, neon
`#00ffa3` accent, JetBrains Mono, nav, hero with rotating roles, the
About/Skills/Work/Education/Projects sections, marquee wordmark, blog index with
category filters + search, and syntax-highlighted post bodies. Stack is Astro 6
with `@astrojs/mdx` and a `remark-image-caption` plugin. Content collections
(`blog`, `projects`) are defined in `src/content.config.ts`.

The floating pill seen in dev screenshots is the Astro dev toolbar (dev-only) —
not a design defect.

## Live site inventory (from sitemap)

- `/` — home
- `/blog` — blog index
- `/post/<slug>` — 5 posts:
  - `object-oriented-programming-java-vs-python`
  - `my-first-70km-trail-marathon`
  - `my-first-50km-trail-marathon`
  - `everything-i-know-as-a-software-engineer-pre-2024`
  - `the-chicken-and-egg-problem-of-classes-and-objects-in-ruby-with-a-python-twist`
- `/privacy-policy`
- `/accessibility-statement`

## Decisions (approved)

1. **Cover images** — download the real images from the live Wix pages into
   `public/`, wire to each post.
2. **Engagement** — add **Giscus** comments (GitHub Discussions backed); remove
   the fake view/like/comment counters and the non-functional share-icon row.
3. **Legal pages** — clean, minimal, real privacy + accessibility text (no Wix
   `[placeholder]` boilerplate), reusing the home two-column section layout.
4. **Post header** — match live: centered title + meta, category rendered as
   tag(s) at the bottom of the article.

## Work Items

### A. Design fidelity fixes

- **A1 Wordmark** (`components/Wordmark.astro`): change repeated word from
  `hoangnguyen` to `hoangnguyen.me`.
- **A2 About** (`components/About.astro`): remove the duplicated contact block
  from the left aside so contact appears only in `ContactStrip`. Left column
  keeps just the `ABOUT` label (matches live).
- **A3 Footer** (`components/Footer.astro`): links → `/privacy-policy` and
  `/accessibility-statement`; copyright year sourced once (keep a single
  hardcoded `2024` to match live, or a build-time year — implementer picks the
  simpler; default to `2024` for exact parity).
- **A4 Glyph**: already `<>` in About — no change. Verify no `</>` remains.

### B. Cover images

- **B1**: Extract image URLs from the live `/post/<slug>` and `/blog` pages
  (Wix serves via `static.wixstatic.com`). Download originals into
  `public/blog/<slug>.<ext>`.
- **B2**: Extend `blog` collection schema with an optional `coverImage` string
  (path under `public/`). Keep the existing `cover` enum as a styled fallback.
- **B3**: Blog index card (`pages/blog/index.astro`) and post cover
  (`pages/post/[slug].astro`) render `coverImage` when present, else the
  existing styled placeholder.
- **B4**: Map each of the 5 posts to its downloaded image.

### C. URL structure

- **C1**: Add a `slug` field to each blog entry's frontmatter matching the live
  slugs listed above. (Frontmatter slug avoids renaming files and keeps the CMS
  simple.)
- **C2**: Rename route `pages/blog/[id].astro` → `pages/post/[slug].astro`;
  `getStaticPaths` uses `data.slug`. Keep `/blog` as the index.
- **C3**: Update all internal links (`/blog/<id>` → `/post/<slug>`) in the index
  cards and any "back to blog"/recent-post links.

### D. Post page (`pages/post/[slug].astro`)

- **D1**: Center the header — title + meta centered; move the category out of
  the top chip to a tag row at the **bottom** of the article (above comments).
- **D2**: Render `coverImage` inline (replacing the empty placeholder box).
- **D3**: Add a **Recent Posts** block below the article — up to 3 other posts
  as compact cards (reuse card styling), excluding the current post.
- **D4**: Add a **Giscus** comments component below Recent Posts.

### E. Giscus comments (`components/Comments.astro`)

- Client-side Giscus embed script, themed to match (`--bg`/`--accent`), mapped
  by `pathname`, lazy-loaded.
- Config values (`data-repo`, `data-repo-id`, `data-category`,
  `data-category-id`) kept in one place with clearly-marked placeholders.
- **Documented prerequisite** (README note): create a public GitHub repo, enable
  Discussions, install the giscus GitHub app, fill in the 4 config values.
  Component renders harmlessly (empty) until configured.

### F. Missing pages

- **F1** `pages/privacy-policy.astro`: home two-column section layout
  (`.section` / `.section-label` / `.section-body`), centered page title,
  Nav + Footer. Clean minimal real privacy text.
- **F2** `pages/accessibility-statement.astro`: same layout, clean minimal real
  accessibility statement (site owner, WCAG intent, contact for issues — no
  `[placeholder]` text).

### G. Keystatic CMS

- **G1**: Install `@keystatic/core` and `@keystatic/astro`; add the Astro
  integration + React (`@astrojs/react`) which Keystatic requires; set
  `output` appropriately for the admin route.
- **G2**: `keystatic.config.ts` — `local` storage; collections for `blog`
  (fields: title, category select, date, readTime, slug, cover select,
  coverImage image, plus Markdown/MDX body) and `projects` (title, desc, url,
  order). Paths point at existing `src/content/{blog,projects}`.
- **G3**: Admin UI reachable at `/keystatic` in dev (`npm run dev`).
- **G4**: Update `package.json` (remove stale `cms`/decap script) and README
  with the write→publish flow: edit in `/keystatic` → saves Markdown to repo →
  rebuild/redeploy. Note the path to flip `local` → `github` storage later.

## Non-goals / known divergences

- View/like/comment **counts** from Wix are not reproduced (no backend).
- Giscus is inert until a public GitHub repo + app are configured.
- Legal page copy intentionally differs from the Wix boilerplate (cleaner).

## Testing / verification

- `npm run build` succeeds with zero errors; all 5 posts build at
  `/post/<slug>` matching live slugs; `/privacy-policy`,
  `/accessibility-statement`, `/blog`, `/` all present in `dist/`.
- Playwright re-screenshot of `/`, `/blog`, one `/post/<slug>`, and both legal
  pages; visually diff against the captured live screenshots in the scratchpad.
- `/keystatic` loads in dev and lists blog + project entries; creating a test
  post writes a Markdown file into `src/content/blog/` and it renders.
- No broken internal links (old `/blog/<id>` links removed).

## Notes

- Repo is **not** under git yet. The design doc cannot be committed until
  `git init`. Recommend initializing git (also a prerequisite for Giscus/GitHub
  storage and any future hosting) — to be confirmed with the owner.
