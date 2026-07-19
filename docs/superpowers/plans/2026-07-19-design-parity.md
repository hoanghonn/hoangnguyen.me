# Design Parity & Missing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Astro rebuild of hoangnguyen.me to visual/structural parity with the live Wix site, add the two missing pages, align blog URLs to `/post/<slug>`, and add Giscus comments — keeping the existing Decap CMS.

**Architecture:** Static Astro 6 site. Content lives in `src/content/{blog,projects}` (Markdown/MDX) with schemas in `src/content.config.ts`. Pages in `src/pages`, shared UI in `src/components`, global CSS in `src/styles/global.css` + inline `<style>` per component. No SSR, no unit-test framework — verification is `npm run build` + Playwright screenshot comparison against captured live screenshots.

**Tech Stack:** Astro 6, `@astrojs/mdx`, JetBrains Mono, Decap CMS (authoring), Giscus (comments), Playwright (verification only, via `/home/hoanghonn/.pyenv/shims/python`).

## Global Constraints

- **Work in the worktree only:** `/home/hoanghonn/personal/hoang-nguyen-me.wt/design-parity` on branch `design-parity`. **Never push to `origin/main`.** A parallel session is actively committing to `main`.
- **Do not touch** deployment files (Dockerfile, nginx, Cloud Build, GCP, `docs/superpowers/plans/2026-07-19-docker-gcp-deployment.md`) or restructure Decap beyond adding fields.
- **Design tokens (verbatim):** `--bg:#222222`, `--fg:#e2e2e2`, `--fg-dim:#a8a8a8`, `--fg-subtle:#6a6a6a`, `--rule:#333333`, `--card:#3f3f3f`, `--card-img:#4a4a4a`, `--accent:#00ffa3`, `--accent-deep:#00d987`. Font: JetBrains Mono.
- **Live slugs (verbatim):** `object-oriented-programming-java-vs-python`, `my-first-70km-trail-marathon`, `my-first-50km-trail-marathon`, `everything-i-know-as-a-software-engineer-pre-2024`, `the-chicken-and-egg-problem-of-classes-and-objects-in-ruby-with-a-python-twist`.
- **File→slug mapping (verbatim):**
  - `oop-java-vs-python.md` → `object-oriented-programming-java-vs-python`
  - `first-70km-trail.mdx` → `my-first-70km-trail-marathon`
  - `first-50km-trail.md` → `my-first-50km-trail-marathon`
  - `everything-i-know-pre-2024.md` → `everything-i-know-as-a-software-engineer-pre-2024`
  - `ruby-classes-objects.md` → `the-chicken-and-egg-problem-of-classes-and-objects-in-ruby-with-a-python-twist`
- **Copyright:** footer year is hardcoded `2024` (matches live).
- **Build command:** `npm run build` must finish with 0 errors before every commit.
- **Commit messages** end with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## Task 1: Design fidelity quick fixes (Wordmark, About, Footer)

Small, isolated component edits with no interface impact.

**Files:**
- Modify: `src/components/Wordmark.astro`
- Modify: `src/components/About.astro`
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing new (same component APIs).

- [ ] **Step 1: Wordmark — change repeated word to `hoangnguyen.me`**

Replace every occurrence of `hoangnguyen` with `hoangnguyen.me` in `src/components/Wordmark.astro`. The file has 8 `<span class="wordmark-word">` / `wordmark-word outline` entries; each inner text becomes `hoangnguyen.me`:

```astro
---
---
<div class="wordmark" aria-hidden="true">
  <div class="marquee-track">
    <span class="wordmark-word">hoangnguyen.me</span>
    <span class="wordmark-word outline">hoangnguyen.me</span>
    <span class="wordmark-word">hoangnguyen.me</span>
    <span class="wordmark-word outline">hoangnguyen.me</span>
    <span class="wordmark-word">hoangnguyen.me</span>
    <span class="wordmark-word outline">hoangnguyen.me</span>
    <span class="wordmark-word">hoangnguyen.me</span>
    <span class="wordmark-word outline">hoangnguyen.me</span>
  </div>
</div>
```

- [ ] **Step 2: About — remove the duplicated contact block from the left aside**

In `src/components/About.astro`, replace the left `<div>` (containing `section-aside` with the contact lines) so the aside is empty (live shows only the `ABOUT` label). Replace the block from `<div>` through its closing `</div>` before `<div class="section-body">`:

```astro
  <div>
    <div class="section-label">ABOUT</div>
  </div>
```

Leave the rest of `About.astro` (glyph `&lt;&gt;`, heading, paragraph, LINKEDIN button, `<style>`) unchanged.

- [ ] **Step 3: Footer — fix links and year**

Replace the body of `src/components/Footer.astro`:

```astro
---
---
<footer class="footer">
  <div class="footer-left">
    <a href="/privacy-policy">Privacy Policy</a>
    <a href="/accessibility-statement">Accessibility Statement</a>
  </div>
  <div>© 2024 by Hoang Nguyen</div>
</footer>
```

- [ ] **Step 4: Verify no stray `</>` glyph**

Run: `grep -rn '&lt;/&gt;\|</>' src/` — Expected: no matches (About already uses `&lt;&gt;`).

- [ ] **Step 5: Build**

Run: `cd /home/hoanghonn/personal/hoang-nguyen-me.wt/design-parity && npm run build`
Expected: `Complete!`, 7 pages, 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Wordmark.astro src/components/About.astro src/components/Footer.astro
git commit -m "fix: wordmark .me, dedupe About contact, correct footer links/year

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Blog content layer — slugs, coverImage schema, downloaded images

Adds routing slugs, a cover-image field, and the real images. No rendering change yet (Task 3 consumes these).

**Files:**
- Modify: `src/content.config.ts:1-24` (blog schema)
- Modify: all 5 files in `src/content/blog/`
- Create: image files under `public/images/blog/`
- Create (temp, delete after): `scratchpad extract script` (outside repo)

**Interfaces:**
- Produces: `blog` entries now expose `data.slug: string` and optional `data.coverImage?: string` (path like `/images/blog/<slug>.<ext>`). Task 3 & 4 consume these.

- [ ] **Step 1: Extend the blog schema**

In `src/content.config.ts`, add `slug` (required) and `coverImage` (optional) to the blog `schema`:

```ts
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['Technology', 'Trail Running']),
    date: z.string(),
    readTime: z.string(),
    slug: z.string(),
    cover: z.enum(['illustration', 'photo', 'empty', 'gradient']).default('empty'),
    coverGradient: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});
```

- [ ] **Step 2: Download the live cover images**

The live posts serve cover images from `static.wixstatic.com`. Extract and download them with this script (run from the worktree; requires the dev-tooling Playwright at `/home/hoanghonn/.pyenv/shims/python`). It reads each live post's `og:image`, strips Wix render params, and saves to `public/images/blog/<slug>.<ext>`. `my-first-70km-trail-marathon` may already exist as `70km-finisher.avif` — the script skips any target that already exists.

Create `/tmp/.../scratchpad/covers.py` (use the session scratchpad path):

```python
import asyncio, os, re, urllib.request
from playwright.async_api import async_playwright

OUT = "/home/hoanghonn/personal/hoang-nguyen-me.wt/design-parity/public/images/blog"
os.makedirs(OUT, exist_ok=True)
SLUGS = [
    "object-oriented-programming-java-vs-python",
    "my-first-70km-trail-marathon",
    "my-first-50km-trail-marathon",
    "everything-i-know-as-a-software-engineer-pre-2024",
    "the-chicken-and-egg-problem-of-classes-and-objects-in-ruby-with-a-python-twist",
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        for s in SLUGS:
            await pg.goto(f"https://www.hoangnguyen.me/post/{s}", wait_until="load", timeout=45000)
            img = await pg.evaluate("() => { const m=document.querySelector('meta[property=\"og:image\"]'); return m?m.content:null; }")
            if not img: print("NO IMAGE", s); continue
            # strip Wix transform suffix (…/v1/fill/…) to get original when possible
            base = re.split(r"/v1/(fill|fit|crop)/", img)[0]
            url = base if base.startswith("http") else img
            ext = ".jpg" if ".jpg" in url.lower() else (".png" if ".png" in url.lower() else (".avif" if ".avif" in url.lower() else ".jpg"))
            dest = f"{OUT}/{s}{ext}"
            if os.path.exists(dest): print("skip exists", dest); continue
            urllib.request.urlretrieve(url, dest); print("saved", dest)
        await b.close()
asyncio.run(main())
```

Run: `/home/hoanghonn/.pyenv/shims/python /tmp/.../scratchpad/covers.py`
Expected: `saved …/images/blog/<slug>.<ext>` lines (or `skip exists`). If any prints `NO IMAGE`, fall back to a full-page screenshot crop of that post's hero, or leave that post's `coverImage` unset (it keeps the styled placeholder).

- [ ] **Step 3: Verify downloaded files**

Run: `ls -la public/images/blog/`
Expected: an image per slug (except any that printed `NO IMAGE`). Note the exact filenames+extensions for Step 4.

- [ ] **Step 4: Add `slug` + `coverImage` frontmatter to each post**

Edit each file's frontmatter. Use the verbatim file→slug mapping from Global Constraints. Set `coverImage` to `/images/blog/<slug>.<ext>` using the exact filename from Step 3 (omit `coverImage` for any post with no downloaded image). Example for `src/content/blog/first-50km-trail.md` — add these two lines to the existing frontmatter block:

```md
slug: my-first-50km-trail-marathon
coverImage: /images/blog/my-first-50km-trail-marathon.jpg
```

Repeat for the other four files with their mapped slug + image path. For `first-70km-trail.mdx`, if the existing `70km-finisher.avif` is the intended cover, set `coverImage: /images/blog/70km-finisher.avif`.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: 0 errors. (Routes still `/blog/<id>` until Task 3 — that's fine.)

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content/blog public/images/blog
git commit -m "feat: add blog slugs, coverImage field, and downloaded cover images

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Route to `/post/<slug>` and update the blog index

Switches routing to match live URLs and updates the index cards (covers, drop the fake share/stat row).

**Files:**
- Create: `src/pages/post/[slug].astro` (moved/renamed from `src/pages/blog/[id].astro`)
- Delete: `src/pages/blog/[id].astro`
- Modify: `src/pages/blog/index.astro` (card `href`, cover rendering, remove `.card-actions` SVG row)

**Interfaces:**
- Consumes: `data.slug`, `data.coverImage` from Task 2.
- Produces: post pages at `/post/<slug>`; index cards link to `/post/<slug>`.

- [ ] **Step 1: Create the new route file**

`git mv src/pages/blog/[id].astro src/pages/post/[slug].astro` (create `src/pages/post/` first if needed). Then edit `src/pages/post/[slug].astro` — change `getStaticPaths` to key on `slug`, and render `coverImage` when present:

```astro
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({ params: { slug: post.data.slug }, props: { post } }));
}
```

And replace the `.post-cover` div so it uses the image when set:

```astro
      {post.data.coverImage ? (
        <img class="post-cover-img" src={post.data.coverImage} alt={post.data.title} />
      ) : (
        <div
          class:list={['post-cover', post.data.cover]}
          style={post.data.coverGradient ? `background: ${post.data.coverGradient}` : undefined}
        ></div>
      )}
```

Add to the `<style>` block:

```css
  .post-cover-img { width: 100%; aspect-ratio: 16 / 7; object-fit: cover; margin-bottom: 48px; display: block; }
  @media (max-width: 640px) { .post-cover-img { aspect-ratio: 16 / 9; margin-bottom: 24px; } }
```

Update the back link (already `/blog`) — no change. (Task 4 restyles this file's header; keep structural edits minimal here.)

- [ ] **Step 2: Update blog index cards**

In `src/pages/blog/index.astro`: change the card `href` to `/post/${post.data.slug}`; render `coverImage` inside `.card-cover`; delete the entire `.card-actions` `<div>` (the fb/x/link/menu SVGs). Card cover block becomes:

```astro
          <div
            class:list={['card-cover', post.data.cover]}
            style={post.data.coverImage
              ? `background-image:url(${post.data.coverImage})`
              : (post.data.coverGradient ? `background: ${post.data.coverGradient}` : undefined)}
          ></div>
```

In `.card-body`, remove the `<div class="card-actions">…</div>` block entirely (and its trailing `.card-divider` may stay). The `.card-cover.photo::after` gradient already darkens photos for legible overlay text; add the same darkening whenever a `coverImage` is present by ensuring `.card-cover` with an inline `background-image` also gets the `::after`. Simplest: keep `cover: photo` in frontmatter for image posts so the existing `.photo::after` applies. (Set `cover: photo` on the 5 posts in Task 2 frontmatter if not already — adjust Task 2 Step 4 accordingly.)

- [ ] **Step 3: Remove now-unused `.card-actions` CSS**

Delete the `.card-actions`, `.card-actions svg`, `.card-actions svg:hover`, and `.spacer` rules from the index `<style>` (dead after Step 2).

- [ ] **Step 4: Build and check routes**

Run: `npm run build`
Expected: 0 errors; output lists `/post/<slug>/index.html` for all 5 slugs and `/blog/index.html`. Confirm no `/blog/<id>` route remains: `ls dist/blog/` should show only `index.html`.

- [ ] **Step 5: Verify no dead internal links**

Run: `grep -rn '/blog/' src/ | grep -v '"/blog"' | grep -v 'href="/blog"'`
Expected: no links of the form `/blog/<something>` (only the `/blog` index link remains).

- [ ] **Step 6: Screenshot the index and one post**

Run the project screenshot helper (Playwright) against `http://localhost:4321/blog` and `http://localhost:4321/post/the-chicken-and-egg-problem-of-classes-and-objects-in-ruby-with-a-python-twist` after `npm run dev`. Compare card covers now show images vs the captured `shots/live-blog.png`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/post src/pages/blog/index.astro
git rm src/pages/blog/[id].astro 2>/dev/null; git add -A src/pages/blog
git commit -m "feat: route posts at /post/<slug>, show cover images, drop fake stat row

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Post page redesign — centered header, bottom tags, Recent Posts

Matches the live post layout.

**Files:**
- Modify: `src/pages/post/[slug].astro`

**Interfaces:**
- Consumes: `data.slug`, `data.category`, `data.coverImage`, plus `getCollection('blog')` for Recent Posts.
- Produces: nothing new.

- [ ] **Step 1: Center the header and move category to the bottom**

In `src/pages/post/[slug].astro`, change `.post-header` to center content and remove the top category chip. New header markup:

```astro
      <header class="post-header">
        <h1 class="post-title">{post.data.title}</h1>
        <div class="post-meta">
          <div class="avatar"></div>
          <span>Hoang Nguyen</span>
          <span class="dot">·</span>
          <span>{post.data.date}</span>
          <span class="dot">·</span>
          <span>{post.data.readTime}</span>
        </div>
      </header>
```

Update styles: `.post-header { text-align: center; margin-bottom: 36px; }` and `.post-meta { justify-content: center; }`. Keep `.post-body` left-aligned for readability.

- [ ] **Step 2: Add a category tag row after the body**

After the closing `</div>` of `.post-body`, before `.back-row`, add:

```astro
      <div class="post-tags">
        <span class="tag">{post.data.category}</span>
      </div>
```

Add style: `.post-tags { max-width: 760px; margin: 40px auto 0; } .post-tags .tag { display:inline-block; background:var(--accent); color:#06241a; font-size:11px; font-weight:600; padding:4px 8px; letter-spacing:0.02em; }` and remove the now-unused top `.tag` rule if it is no longer referenced.

- [ ] **Step 3: Add Recent Posts block**

In the frontmatter of `[slug].astro`, after loading `post`, compute recents:

```astro
const all = (await getCollection('blog')).sort(
  (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
);
const recent = all.filter(p => p.data.slug !== post.data.slug).slice(0, 3);
```

Before `.back-row`, render:

```astro
      <section class="recent">
        <div class="recent-head"><span>Recent Posts</span><a href="/blog">See All</a></div>
        <div class="recent-grid">
          {recent.map(p => (
            <a class="recent-card" href={`/post/${p.data.slug}`}>
              <div class="recent-cover" style={p.data.coverImage ? `background-image:url(${p.data.coverImage})` : undefined}></div>
              <h4>{p.data.title}</h4>
              <div class="recent-meta">{p.data.date} · {p.data.readTime}</div>
            </a>
          ))}
        </div>
      </section>
```

Add styles (scoped): `.recent { max-width:760px; margin:64px auto 0; } .recent-head { display:flex; justify-content:space-between; font-size:12px; color:var(--fg-dim); margin-bottom:20px; } .recent-head a:hover{color:var(--accent);} .recent-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; } .recent-card h4{font-size:13px; margin:10px 0 4px; line-height:1.35;} .recent-cover{aspect-ratio:16/9; background:var(--card-img); background-size:cover; background-position:center;} .recent-meta{font-size:11px;color:var(--fg-subtle);} @media(max-width:640px){.recent-grid{grid-template-columns:1fr;}}`

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: 0 errors; 5 post pages built.

- [ ] **Step 5: Screenshot vs live**

Screenshot `http://localhost:4321/post/my-first-50km-trail-marathon` and compare to `shots/live-post.png` (centered title, bottom category tag, inline cover, recent posts).

- [ ] **Step 6: Commit**

```bash
git add src/pages/post/[slug].astro
git commit -m "feat: center post header, category tags at bottom, add Recent Posts

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Giscus comments component

Adds a comments section (inert until the GitHub repo is configured).

**Files:**
- Create: `src/components/Comments.astro`
- Modify: `src/pages/post/[slug].astro` (include `<Comments />` after Recent Posts)

**Interfaces:**
- Consumes: nothing.
- Produces: `Comments.astro` — a self-contained embed; no props.

- [ ] **Step 1: Create the component**

`src/components/Comments.astro` — placeholders clearly marked; the script only injects when the repo id is filled in:

```astro
---
// Fill these after enabling GitHub Discussions + installing the giscus app
// at https://giscus.app for repo hoanghonn/hoangnguyen.me:
const REPO = 'hoanghonn/hoangnguyen.me';
const REPO_ID = 'REPLACE_WITH_REPO_ID';
const CATEGORY = 'Announcements';
const CATEGORY_ID = 'REPLACE_WITH_CATEGORY_ID';
const configured = !REPO_ID.startsWith('REPLACE_') && !CATEGORY_ID.startsWith('REPLACE_');
---
{configured && (
  <section class="comments" data-giscus
    data-repo={REPO} data-repo-id={REPO_ID}
    data-category={CATEGORY} data-category-id={CATEGORY_ID}>
  </section>
)}

<style>
  .comments { max-width: 760px; margin: 56px auto 0; }
</style>

<script>
  const el = document.querySelector('[data-giscus]') as HTMLElement | null;
  if (el) {
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true; s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', el.dataset.repo!);
    s.setAttribute('data-repo-id', el.dataset.repoId!);
    s.setAttribute('data-category', el.dataset.category!);
    s.setAttribute('data-category-id', el.dataset.categoryId!);
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-theme', 'dark_dimmed');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-loading', 'lazy');
    el.appendChild(s);
  }
</script>
```

- [ ] **Step 2: Include it on the post page**

In `src/pages/post/[slug].astro`, import at top: `import Comments from '../../components/Comments.astro';` and render `<Comments />` immediately after the `.recent` section.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: 0 errors. With placeholders unfilled, `configured` is false → no giscus markup emitted (inert, as intended).

- [ ] **Step 4: Commit**

```bash
git add src/components/Comments.astro src/pages/post/[slug].astro
git commit -m "feat: add Giscus comments component (inert until repo configured)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Missing pages — Privacy Policy & Accessibility Statement

**Files:**
- Create: `src/pages/privacy-policy.astro`
- Create: `src/pages/accessibility-statement.astro`

**Interfaces:**
- Consumes: `Base`, `Nav`, `Footer`, and the global `.section` layout.
- Produces: routes `/privacy-policy`, `/accessibility-statement`.

- [ ] **Step 1: Create `src/pages/privacy-policy.astro`**

Reuses the home two-column `.section` layout; centered page title; clean real copy (no `[placeholder]`):

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
---
<Base title="Privacy Policy — Hoang Nguyen">
  <div class="page">
    <Nav activePage="home" borderBottom />
    <h1 class="legal-title">Privacy Policy</h1>

    <section class="section">
      <div class="section-label">What This Site Collects</div>
      <div class="section-body">
        <p>hoangnguyen.me is a personal portfolio and blog. The site itself does not
        ask you for personal information and does not run advertising or tracking
        cookies. Basic, anonymous request logs (such as page views) may be produced
        by the hosting provider for reliability and security.</p>
      </div>
    </section>

    <section class="section">
      <div class="section-label">Comments</div>
      <div class="section-body">
        <p>Blog comments are powered by Giscus, which stores comments as GitHub
        Discussions. If you choose to comment, you do so with your GitHub account
        under GitHub's own privacy policy. You can edit or delete your comments at
        any time from the corresponding GitHub Discussion.</p>
      </div>
    </section>

    <section class="section">
      <div class="section-label">Contact</div>
      <div class="section-body">
        <p>Questions about privacy? Reach out via the contact details on the
        <a href="/">home page</a>.</p>
      </div>
    </section>

    <Footer />
  </div>
</Base>

<style>
  .legal-title { text-align: center; font-size: clamp(28px, 4vw, 44px); font-weight: 700; margin: 48px 0 8px; }
  .section-body p { color: var(--fg-dim); margin: 0 0 16px; }
  .section-body a:hover { color: var(--accent); }
</style>
```

- [ ] **Step 2: Create `src/pages/accessibility-statement.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
---
<Base title="Accessibility Statement — Hoang Nguyen">
  <div class="page">
    <Nav activePage="home" borderBottom />
    <h1 class="legal-title">Accessibility Statement</h1>

    <section class="section">
      <div class="section-label">Our Commitment</div>
      <div class="section-body">
        <p>I want hoangnguyen.me to be usable by as many people as possible,
        including visitors who rely on assistive technologies such as screen
        readers or keyboard navigation.</p>
      </div>
    </section>

    <section class="section">
      <div class="section-label">What We've Done</div>
      <div class="section-body">
        <p>The site aims to follow WCAG 2.1 AA guidance: semantic HTML and heading
        structure, alt text on images, colour combinations chosen for contrast,
        reduced motion honoured via <code>prefers-reduced-motion</code>, and full
        keyboard operability.</p>
      </div>
    </section>

    <section class="section">
      <div class="section-label">Feedback</div>
      <div class="section-body">
        <p>If you encounter an accessibility barrier on this site, please let me
        know through the contact details on the <a href="/">home page</a> and I'll
        do my best to fix it.</p>
      </div>
    </section>

    <Footer />
  </div>
</Base>

<style>
  .legal-title { text-align: center; font-size: clamp(28px, 4vw, 44px); font-weight: 700; margin: 48px 0 8px; }
  .section-body p { color: var(--fg-dim); margin: 0 0 16px; }
  .section-body code { background: #1a1a1a; padding: 2px 6px; color: var(--accent); font-size: 12px; }
  .section-body a:hover { color: var(--accent); }
</style>
```

- [ ] **Step 3: Build and verify routes**

Run: `npm run build`
Expected: 0 errors; `dist/privacy-policy/index.html` and `dist/accessibility-statement/index.html` exist. Footer links (Task 1) now resolve.

- [ ] **Step 4: Screenshot both pages**

Screenshot `/privacy-policy` and `/accessibility-statement`; confirm section layout matches the home two-column style and `shots/live-privacy.png` structure.

- [ ] **Step 5: Commit**

```bash
git add src/pages/privacy-policy.astro src/pages/accessibility-statement.astro
git commit -m "feat: add privacy-policy and accessibility-statement pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Decap config sync + README docs (light-touch)

Keeps the parallel effort's Decap CMS able to edit the new fields, and documents the flow.

**Files:**
- Modify: `public/admin/config.yml` (add `slug`, `coverImage` fields to the blog collection)
- Modify: `README.md` (authoring + Giscus setup notes)

**Interfaces:** none.

> **Merge caution:** `public/admin/config.yml` is owned by the parallel effort. Add only the two fields; do not restructure. Expect a possible merge conflict resolved at merge time.

- [ ] **Step 1: Add fields to Decap blog collection**

In `public/admin/config.yml`, under the blog collection `fields:`, add after `readTime`:

```yaml
      - { label: Slug, name: slug, widget: string, hint: "URL path under /post/, e.g. my-first-50km-trail-marathon" }
```

and after `coverGradient`:

```yaml
      - { label: Cover Image, name: coverImage, widget: image, required: false, choose_url: false }
```

- [ ] **Step 2: Document the workflow in README**

Append a section to `README.md`:

```md
## Editing blog posts (Decap CMS)

1. `npm run cms` (starts the local Decap backend) and, in another terminal, `npm run dev`.
2. Open http://localhost:4321/admin — add/edit posts (writes Markdown to `src/content/blog/`).
3. Commit and push the generated Markdown; the site rebuilds from it.

Fields: title, category, date, read time, **slug** (the `/post/<slug>` URL), cover style, optional cover gradient, optional cover image, and body.

## Comments (Giscus)

Comments use Giscus (GitHub Discussions). To enable:
1. Make the repo public and enable Discussions.
2. Install the giscus app: https://github.com/apps/giscus
3. At https://giscus.app, generate `repo-id` and `category-id` and paste them into `src/components/Comments.astro`.
Until configured, the comments section renders nothing.
```

- [ ] **Step 3: Validate config.yml parses**

Run: `/home/hoanghonn/.pyenv/shims/python -c "import yaml,sys; yaml.safe_load(open('public/admin/config.yml')); print('config.yml OK')"`
Expected: `config.yml OK`. (If PyYAML is missing, instead confirm indentation visually — 6-space field indentation matching siblings.)

- [ ] **Step 4: Commit**

```bash
git add public/admin/config.yml README.md
git commit -m "docs: sync Decap config with new blog fields; document authoring + Giscus

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `rm -rf dist && npm run build`
Expected: 0 errors. Confirm these exist in `dist/`: `index.html`, `blog/index.html`, `post/<each of the 5 slugs>/index.html`, `privacy-policy/index.html`, `accessibility-statement/index.html`.

- [ ] **Step 2: Link integrity**

Run: `grep -rIl 'href="/blog/' dist/ || echo "no stale /blog/<id> links"`
Expected: `no stale /blog/<id> links`.

- [ ] **Step 3: Screenshot diff vs live**

Start `npm run dev`; with Playwright capture `/`, `/blog`, `/post/my-first-50km-trail-marathon`, `/privacy-policy`, `/accessibility-statement`. Compare each against the corresponding `shots/live-*.png`. Note any residual gaps as follow-ups (do not fix silently).

- [ ] **Step 4: Report**

Summarize: pages built, screenshots compared, known divergences (Wix stat counts, Giscus pending config, legal copy differs). Leave the branch `design-parity` unpushed for the owner to merge.

---

## Self-Review (completed by author)

- **Spec coverage:** A1–A4 → Task 1; B1–B4 → Task 2; C1–C3 → Task 3; D1–D4 → Tasks 3–5; E → Task 5; F1–F2 → Task 6; G1–G2 → Task 7; testing/verification → Task 8. All spec items mapped.
- **Placeholder scan:** The only intentional placeholders are the Giscus `REPLACE_WITH_*` ids (documented, gated by `configured`) and the temp scratchpad script path `/tmp/.../scratchpad/` (session-specific, filled in at run time). No `TBD`/`TODO`.
- **Type consistency:** `data.slug` (string) and `data.coverImage` (optional string) defined in Task 2 and consumed identically in Tasks 3–4. Route param renamed `id`→`slug` consistently. `getStaticPaths` keys on `post.data.slug` everywhere.
- **Cross-task note:** Task 3 Step 2 depends on the 5 posts carrying `cover: photo` for the `.photo::after` overlay — reconcile by setting `cover: photo` in Task 2 Step 4 frontmatter for image posts.
