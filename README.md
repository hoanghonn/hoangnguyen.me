# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

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
