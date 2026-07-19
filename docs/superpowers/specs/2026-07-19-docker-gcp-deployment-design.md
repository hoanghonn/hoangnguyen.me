# Docker + GCP Deployment Design

**Date:** 2026-07-19
**Project:** hoang-nguyen-me (static Astro portfolio/blog)
**Status:** Approved design, pending implementation plan

## Goal

Deploy the static Astro site as a Docker container to Google Cloud Platform,
with automated build-and-deploy on every push to `main` and a custom domain
with managed TLS.

## Context

- The site is a **fully static** Astro build (no SSR adapter). `astro build`
  emits `dist/`; the container's only job is to serve those files over HTTP.
- Content is authored through Decap CMS locally (`npm run cms`, `local_backend:
  true`) and committed to git. The `/admin` panel uses a `git-gateway` backend
  that depends on Netlify Identity.
- The directory is **not yet a git repo** - version control and a GitHub remote
  must be established as part of this work.
- Node engine is pinned to `>=22.12.0`.

## Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Compute target | **Cloud Run** | Scales to zero (~free at rest for a low-traffic personal site), managed HTTPS, simple custom-domain mapping. |
| Container strategy | **Multi-stage Docker build** | One reproducible `docker build` (node build stage → nginx serve stage); final image ships nginx + static files only, no Node runtime. |
| CI/CD | **Cloud Build trigger** on push to `main` | GCP-native, no external CI secrets; keeps build/deploy inside the cloud. |
| Source repo | **GitHub** | Connected to Cloud Build via the GitHub App. |
| Custom domain | **Cloud Run domain mapping** | Simplest for a single service; Google auto-provisions and renews the TLS cert. |
| Decap CMS in production | **Local-only editing** | `/admin` ships as inert static files; content edits happen locally and flow through git → Cloud Build redeploys. In-production editing (GitHub OAuth backend) is out of scope. |

## Architecture

```
GitHub (main)  ──push──▶  Cloud Build trigger
                              │  1. docker build (multi-stage → nginx image)
                              │  2. push image → Artifact Registry (SHA + latest tags)
                              │  3. gcloud run deploy (image tagged $SHORT_SHA)
                              ▼
                         Cloud Run service (nginx serving static dist/)
                              │
                         Domain mapping + managed TLS
                              ▼
                    hoang-nguyen.me  (DNS at registrar)
```

### Container strategy - multi-stage build

- **Stage 1 (`node:22-alpine`):** `npm ci` + `astro build` → emits `dist/`.
- **Stage 2 (`nginx:alpine`):** copy `dist/` into the nginx web root, add
  `nginx.conf`.

The final image is nginx + static files (tens of MB). The build behaves
identically on a laptop and in Cloud Build.

## Container & nginx behavior

- **Bind to `$PORT`** - Cloud Run injects `PORT` (default 8080); nginx must
  listen on it, not the default 80.
- **Web root** = `/usr/share/nginx/html` (destination of `dist/`).
- **Clean URLs** - `try_files $uri $uri/ $uri.html =404;` so routes like `/blog`
  resolve to Astro's generated `index.html`/`.html` files.
- **404** - serve Astro's generated `404.html`.
- **Caching** - long-lived `immutable` cache for fingerprinted `/_astro/*`
  assets; short/no-cache for HTML so content updates appear immediately after a
  deploy.
- **gzip** on for text/css/js/svg.

### Cloud Run service settings

- Min instances **0** (scale to zero); max small (e.g. 2).
- Memory 128-256Mi, CPU 1.
- **Allow unauthenticated** invocations (public site).
- Region chosen at implementation time (e.g. `asia-southeast1` or
  `us-central1`).

## Cloud Build pipeline

### One-time GCP setup (documented as runbook commands)

1. Create/select a GCP **project**; enable APIs: Cloud Build, Cloud Run,
   Artifact Registry.
2. Create an **Artifact Registry** Docker repo (e.g. `web`) in the chosen region.
3. Grant the **Cloud Build service account**: `roles/run.admin` (deploy to Cloud
   Run) and `roles/iam.serviceAccountUser` (act as the runtime service account).
4. Connect the **GitHub repo** to Cloud Build (GitHub App) and create a
   **trigger** on push to `main`.

### `cloudbuild.yaml` steps

1. `docker build` the multi-stage image, tagged with both `$SHORT_SHA` and
   `latest`.
2. `docker push` both tags to Artifact Registry.
3. `gcloud run deploy` the service using the `$SHORT_SHA` image.

Tagging by commit SHA ties every deploy to an exact commit; rollback is
redeploying an older tag.

### Custom domain

After the first successful deploy, create a Cloud Run **domain mapping** for
`hoang-nguyen.me` (optionally `www`), then add the DNS records it outputs at the
registrar. Google auto-provisions and renews TLS.

## Files this plan adds

- `Dockerfile` - multi-stage build.
- `nginx.conf` - static-serving config (PORT, clean URLs, caching, gzip).
- `.dockerignore` - exclude `node_modules`, `dist`, `.astro`, `.git`, `.gstack`.
- `cloudbuild.yaml` - build/push/deploy steps.
- `docs/deployment.md` - one-time setup + day-to-day deploy runbook.

## Verification strategy

1. Build the image locally and `docker run -p 8080:8080`; confirm nginx serves
   the site, clean URLs work, `/admin` loads, and 404 renders.
2. Push to GitHub; confirm the Cloud Build trigger builds, pushes, and deploys.
3. Verify the `*.run.app` URL is live.
4. Wire the domain mapping and confirm TLS + DNS resolve.

## Out of scope

- In-production CMS editing (GitHub OAuth backend for Decap).
- Load Balancer / Cloud CDN fronting (domain mapping is sufficient for now).
- GKE / Compute Engine alternatives.
