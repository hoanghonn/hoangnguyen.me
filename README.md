# hoangnguyen.me

Personal portfolio and blog for Hoang Nguyen - Engineering Lead at Employment Hero and founder of Code Beavers. Built with [Astro](https://astro.build/) as a fully static site with a dark, monospace aesthetic.

## Tech stack

- **Astro 6** (static output) with `@astrojs/mdx`
- **JetBrains Mono** type, neon-on-charcoal theme
- **Decap CMS** for authoring blog posts (local, git-based)
- **Giscus** for comments (GitHub Discussions)
- Content in Markdown via Astro content collections

## Project structure

```text
src/
├── components/        # Homepage sections (Hero, About, Skills, WorkExperience, Projects, …)
├── content/
│   ├── blog/          # Blog posts (.md) — one file per post
│   └── projects/      # Project cards (.md)
├── content.config.ts  # Collection schemas (blog, projects)
├── layouts/Base.astro # HTML shell + global styles
├── pages/
│   ├── index.astro                    # Home
│   ├── blog/index.astro               # Blog index
│   ├── post/[slug].astro              # Blog post (routes at /post/<slug>)
│   ├── privacy-policy.astro
│   └── accessibility-statement.astro
public/
├── admin/             # Decap CMS (config.yml + index.html)
└── images/blog/       # Blog cover images & galleries
```

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Dev server at `localhost:4321`               |
| `npm run cms`     | Local Decap CMS backend (port 8081)          |
| `npm run build`   | Build static site to `./dist/`               |
| `npm run preview` | Preview the production build locally         |

## Editing content

### Blog posts (Decap CMS - no code)

1. `npm run cms` (Decap backend on port 8081) and, in another terminal, `npm run dev`.
2. Open **http://localhost:4321/admin/index.html** - click **Login** (local mode needs no account) to add/edit posts. Saving writes Markdown to `src/content/blog/`.
   - In the Astro **dev** server, use the full `/admin/index.html` path - plain `/admin` returns 404 because the dev server doesn't auto-serve the folder index. On the built/deployed site (nginx or `npm run preview`), `/admin/` works directly.
3. Commit and push the generated Markdown; the site rebuilds from it.

Blog fields: title, category, date, read time, **slug** (the `/post/<slug>` URL), cover style, optional cover gradient, optional cover image, optional photo gallery, and body.

> Posts that embed the `<ImageGrid>` gallery keep the images in a `gallery:` frontmatter list, so they stay plain Markdown and remain editable in Decap. The gallery renders at the end of the post.

### Homepage sections (code)

The homepage is composed of components in `src/components/`, edited directly:

- **About / role / bio** → `About.astro`
- **Work experience** → `WorkExperience.astro` (each role: date, title, company, optional `url`, bullets)
- **Skills** → `Skills.astro`
- **Rotating hero title** → `Hero.astro` (the `ROLES` array)
- **Projects** → cards live in `src/content/projects/*.md` (title, desc, optional `url`, `order`, optional `award: { label, url }`)

### Comments (Giscus)

Comments use Giscus (GitHub Discussions). To enable:

1. Make the repo public and enable Discussions.
2. Install the giscus app: https://github.com/apps/giscus
3. At https://giscus.app, generate `repo-id` and `category-id` and paste them into `src/components/Comments.astro`.

Until configured, the comments section renders nothing.

## Deployment

The site builds to static files in `dist/`. Deployment (Docker + nginx + Cloud Run) is documented separately in [`docs/deployment.md`](docs/deployment.md).
