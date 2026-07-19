# hoangnguyen.me — Design Parity & Missing Pages

**Date:** 2026-07-19
**Status:** Approved (reconciled with parallel effort)
**Branch:** `design-parity` (isolated worktree; hand off for merge — do NOT push to `main`)

## Goal

Bring the existing Astro rebuild of `hoangnguyen.me` to visual + structural parity
with the live Wix site, fill in the two missing pages, align blog URLs to the live
`/post/<slug>` structure, and add Giscus comments. Keep the blog CMS as the
**Decap** setup already scaffolded by a parallel effort.

## Concurrency context (IMPORTANT)

A **separate, active session/agent** is building this same repo in a different
direction and is committing + pushing to `origin/main` during this work
(observed `main` advance `366aeac → d9d499f` mid-session). To avoid collisions:

- All work happens in an **isolated git worktree** on branch `design-parity`
  (dir: `…/hoang-nguyen-me.wt/design-parity`), separate from the shared checkout.
- **Do not push** to `origin/main`. Deliver a branch; the owner merges when the
  parallel effort settles, resolving any merge conflicts then.
- **Do not touch** files owned by the parallel effort except where schema
  consistency requires it (see CMS below): deployment files (Dockerfile, nginx,
  Cloud Build/GCP, the deployment plan) are entirely out of scope.

## Current State (verified via side-by-side screenshots)

The rebuild already matches the live site closely: dark `#222` theme, neon
`#00ffa3` accent, JetBrains Mono, nav, hero with rotating roles, the
About/Skills/Work/Education/Projects sections, marquee wordmark, blog index with
category filters + search, and syntax-highlighted post bodies. Stack is Astro 6
with `@astrojs/mdx` and a `remark-image-caption` plugin. Content collections
(`blog`, `projects`) are defined in `src/content.config.ts`. The floating pill in
dev screenshots is the Astro dev toolbar (dev-only) — not a defect.

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

1. **Cover images** — download the real images from the live Wix pages, wire to
   each post. (Parallel effort already fetched `70km-finisher.avif`; reuse
   existing files, only download the missing ones — no duplicate downloads.)
2. **Engagement** — add **Giscus** comments (GitHub Discussions backed); remove
   the fake view/like/comment counters and the non-functional share-icon row.
3. **Legal pages** — clean, minimal, real privacy + accessibility text (no Wix
   `[placeholder]` boilerplate), reusing the home two-column section layout.
4. **Post header** — match live: centered title + meta, category rendered as
   tag(s) at the bottom of the article.
5. **CMS** — keep **Decap** (already scaffolded at `public/admin/`). Do NOT add
   Keystatic. My only CMS change: keep `public/admin/config.yml` in sync with any
   blog-schema fields I add, and document the local edit→commit→rebuild flow.

## Work Items

### A. Design fidelity fixes

- **A1 Wordmark** (`components/Wordmark.astro`): repeated word `hoangnguyen` →
  `hoangnguyen.me`.
- **A2 About** (`components/About.astro`): remove the duplicated contact block
  from the left aside so contact appears only in `ContactStrip`; left column
  keeps just the `ABOUT` label (matches live).
- **A3 Footer** (`components/Footer.astro`): links → `/privacy-policy` and
  `/accessibility-statement`; copyright year hardcoded `2024` (matches live).
- **A4 Glyph**: already `<>` in About — verify no `</>` remains elsewhere.

### B. Cover images

- **B1**: Extract image URLs from the live `/post/<slug>` and `/blog` pages
  (Wix `static.wixstatic.com`). Download only images not already present into a
  single conventional location under `public/` (reuse the parallel effort's
  `public/images/blog/` to avoid a competing directory).
- **B2**: Extend the `blog` schema with an optional `coverImage` string (path
  under `public/`). Keep the existing `cover` enum as styled fallback.
- **B3**: Blog index card and post cover render `coverImage` when present, else
  the existing styled placeholder.
- **B4**: Map each of the 5 posts to its image.

### C. URL structure

- **C1**: Add a `slug` field to each blog entry's frontmatter matching the live
  slugs above (frontmatter slug; avoids renaming files, keeps Decap simple).
- **C2**: New route `pages/post/[slug].astro` (replaces `pages/blog/[id].astro`);
  `getStaticPaths` uses `data.slug`. Keep `/blog` as the index.
- **C3**: Update internal links (`/blog/<id>` → `/post/<slug>`) in index cards,
  back-to-blog, and recent-post links.

### D. Post page (`pages/post/[slug].astro`)

- **D1**: Center the header — title + meta centered; move category from top chip
  to a tag row at the **bottom** of the article (above comments).
- **D2**: Render `coverImage` inline (replacing the empty placeholder box).
- **D3**: Add a **Recent Posts** block below the article (≤3 other posts, reuse
  card styling, exclude current).
- **D4**: Add the Giscus comments component below Recent Posts.

### E. Giscus comments (`components/Comments.astro`)

- Client-side Giscus embed, themed to match (`--bg`/`--accent`), mapped by
  `pathname`, lazy-loaded.
- Config (`data-repo`, `data-repo-id`, `data-category`, `data-category-id`) in
  one place with clearly-marked placeholders; renders harmlessly (empty) until
  configured.
- **Documented prerequisite** (README): repo is `hoanghonn/hoangnguyen.me` —
  make it public, enable Discussions, install the giscus GitHub app, fill the 4
  config values.

### F. Missing pages

- **F1** `pages/privacy-policy.astro`: home two-column section layout
  (`.section` / `.section-label` / `.section-body`), centered page title, Nav +
  Footer. Clean minimal real privacy text.
- **F2** `pages/accessibility-statement.astro`: same layout, clean minimal real
  accessibility statement (owner, WCAG intent, contact for issues — no
  `[placeholder]` text).

### G. Decap config sync (light-touch — parallel effort owns Decap)

- **G1**: In `public/admin/config.yml`, add the new blog fields I introduce
  (`slug`; `coverImage` as an image widget pointing at `public/images/blog`) so
  the CMS can edit them. Do not otherwise restructure Decap.
- **G2**: README: document the local authoring flow — `npm run cms`
  (`npx decap-server`) + `npm run dev`, open `/admin`, edit, save → writes
  Markdown to `src/content/blog/`, commit + push → rebuild. Note Decap's
  git-gateway backend is local-only in this setup (no Netlify Identity in prod).

## Non-goals / known divergences

- Deployment (Docker/GCP/nginx/Cloud Build) — owned by the parallel effort.
- Keystatic — explicitly not used.
- Wix view/like/comment **counts** — not reproduced (no backend).
- Giscus — inert until the GitHub repo is public + Discussions + app configured.
- Legal page copy intentionally differs from Wix boilerplate (cleaner).

## Testing / verification

- `npm run build` succeeds with zero errors; all 5 posts build at `/post/<slug>`
  matching live slugs; `/privacy-policy`, `/accessibility-statement`, `/blog`,
  `/` present in `dist/`.
- Playwright re-screenshot of `/`, `/blog`, one `/post/<slug>`, and both legal
  pages; visually diff against the captured live screenshots in the scratchpad.
- No broken internal links (old `/blog/<id>` links removed).
- `public/admin/config.yml` still parses and lists the new fields.

## Notes / handoff

- Repo is under git with remote `github.com/hoanghonn/hoangnguyen.me`.
- Work lands on branch `design-parity`. Owner reviews, then merges into `main`
  after coordinating with the parallel (Decap + deployment) effort. Any merge
  conflicts (likely in `src/content.config.ts`, blog frontmatter, or
  `public/admin/config.yml`) get resolved at merge time.
