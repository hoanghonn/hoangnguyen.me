# Docker + GCP Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the static Astro site as an nginx Docker container to Cloud Run, auto-built and deployed on every push to `main` via a Cloud Build trigger, served over a custom domain with managed TLS.

**Architecture:** A multi-stage Docker build compiles the Astro site (`node:22-alpine`) and copies the static `dist/` into an `nginx:alpine` image that serves it. A Cloud Build trigger on GitHub `main` builds the image, pushes it to Artifact Registry (tagged by commit SHA), and deploys it to Cloud Run. A Cloud Run domain mapping fronts the service with a Google-managed TLS certificate.

**Tech Stack:** Astro (static), Docker (multi-stage), nginx:alpine, Google Cloud Run, Artifact Registry, Cloud Build, GitHub.

## Global Constraints

- Node engine: `>=22.12.0` — build stage MUST use `node:22-alpine` (or newer 22.x).
- Site is fully static — the container serves files only; no Node runtime in the final image.
- nginx MUST listen on port `8080` (Cloud Run default container port).
- Deploy images tagged by `$SHORT_SHA` (immutable, rollback-able); never deploy `:latest`.
- Cloud Run service: allow unauthenticated, min-instances `0`, max-instances `2`, memory `256Mi`.
- Decap CMS stays local-only; `/admin` ships as inert static files (no production auth backend).

**User-specific values** — the implementer exports these before running GCP commands (substitute real values):

```bash
export PROJECT_ID="your-gcp-project-id"      # e.g. hoang-nguyen-me
export REGION="asia-east1"                    # Taiwan: Tier 1 pricing + low latency to Vietnam/SEA
export REPO="web"                             # Artifact Registry repo name
export SERVICE="hoang-nguyen-me"              # Cloud Run service name
export DOMAIN="hoangnguyen.me"                # custom domain
export GH_REPO="hoanghonn/hoangnguyen.me"     # GitHub owner/repo (existing, empty, public)
```

> **Environment note:** Docker is not available in the authoring environment (Docker Desktop WSL integration is off). Task 2's local `docker build`/`docker run` verification steps must be run on a machine with Docker. The Dockerfile is additionally validated in the cloud by Cloud Build in Task 4.

---

### Task 1: Initialize git and push to the existing GitHub repo

The GitHub repo `$GH_REPO` already exists and is empty. This task initializes local git and pushes the current project to it.

**Files:**
- Create: `.git/` (via `git init`)
- Uses existing: `.gitignore` (already excludes `dist/`, `node_modules/`, `.astro/`, `.gstack/`, `.env*`)

**Interfaces:**
- Produces: branch `main` pushed to `$GH_REPO` — Task 5's Cloud Build trigger watches it.

- [ ] **Step 1: Initialize the repo on `main`**

```bash
cd /home/hoanghonn/personal/hoang-nguyen-me
git init -b main
```
(If it reports the repo is already initialized, continue.)

- [ ] **Step 2: Verify the build artifacts are ignored, then stage everything**

```bash
git add -A
git status --short | grep -E 'node_modules|dist/|\.astro/|\.gstack/' && echo "LEAK - fix .gitignore" || echo "clean"
```
Expected: `clean` (none of those paths are staged).

- [ ] **Step 3: Initial commit (includes the deployment spec + plan)**

```bash
git commit -m "chore: initial commit of Astro site and deployment plan"
```

- [ ] **Step 4: Add the remote and push**

```bash
git remote add origin https://github.com/hoanghonn/hoangnguyen.me.git
git push -u origin main
```
Expected: `main` pushed; `git remote -v` shows `origin` → `hoanghonn/hoangnguyen.me`. (`gh auth status` confirms auth is already in place.)

---

### Task 2: Containerize the site (local build works end to end)

**Files:**
- Create: `Dockerfile`
- Create: `nginx.conf`
- Create: `.dockerignore`

**Interfaces:**
- Produces: a Docker image serving the built site on port `8080` — Task 4's `cloudbuild.yaml` builds this exact Dockerfile.

- [ ] **Step 1: Write `.dockerignore`**

```
node_modules
dist
.astro
.git
.gstack
.vscode
.claude
docs
npm-debug.log*
.DS_Store
```

- [ ] **Step 2: Write `nginx.conf`**

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_min_length 256;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Fingerprinted Astro assets are immutable — cache hard.
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # HTML and everything else — always revalidate so content updates
    # appear immediately after a deploy. Resolve Astro's directory routes.
    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ $uri.html =404;
    }

    error_page 404 /404.html;
}
```

- [ ] **Step 3: Write the multi-stage `Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1

# ---- Build stage: compile the static site ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Serve stage: nginx with only the static output ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
```

- [ ] **Step 4: Build the image**

Run: `docker build -t hoang-nguyen-me:local .`
Expected: build succeeds; final image is based on `nginx:alpine` (no Node in final layer).

- [ ] **Step 5: Run the container**

Run: `docker run --rm -d -p 8080:8080 --name hnm-test hoang-nguyen-me:local`
Expected: container id printed; `docker ps` shows `hnm-test` running.

- [ ] **Step 6: Verify homepage, a directory route, immutable asset caching, and 404**

```bash
curl -sS -o /dev/null -w "home %{http_code}\n" http://localhost:8080/
curl -sS -o /dev/null -w "blog %{http_code}\n" http://localhost:8080/blog/
curl -sS -o /dev/null -w "admin %{http_code}\n" http://localhost:8080/admin/
curl -sS -o /dev/null -w "missing %{http_code}\n" http://localhost:8080/no-such-page
curl -sSI http://localhost:8080/ | grep -i cache-control   # expect: no-cache
```
Expected: `home 200`, `blog 200`, `admin 200`, `missing 404`, and homepage `Cache-Control: no-cache`.

- [ ] **Step 7: Stop the container**

Run: `docker stop hnm-test`

- [ ] **Step 8: Commit**

```bash
git add Dockerfile nginx.conf .dockerignore
git commit -m "feat: containerize static site with multi-stage nginx build"
```

---

### Task 3: One-time GCP project setup

No code changes or commit — this provisions cloud resources. Run once. Assumes `gcloud` is installed and authenticated (`gcloud auth login`).

**Interfaces:**
- Produces: enabled APIs, an Artifact Registry Docker repo `$REPO`, and IAM bindings — Task 4's deploy relies on all three.

- [ ] **Step 1: Select the project**

```bash
gcloud config set project "$PROJECT_ID"
gcloud projects describe "$PROJECT_ID" --format='value(projectId)'
```
Expected: prints `$PROJECT_ID` (create the project in the console first if this errors).

- [ ] **Step 2: Enable required APIs**

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```
Expected: `Operation ... finished successfully.`

- [ ] **Step 3: Create the Artifact Registry Docker repo**

```bash
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Container images for the personal site"
```
Expected: repo created (if it already exists, the "ALREADY_EXISTS" error is fine).

- [ ] **Step 4: Grant the Cloud Build service account deploy permissions**

```bash
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" --role="roles/run.admin"

gcloud iam service-accounts add-iam-policy-binding "$COMPUTE_SA" \
  --member="serviceAccount:${CB_SA}" --role="roles/iam.serviceAccountUser"
```
Expected: two updated IAM policies printed.

- [ ] **Step 5: Verify**

```bash
gcloud artifacts repositories describe "$REPO" --location="$REGION" --format='value(name)'
```
Expected: prints the repo resource path.

---

### Task 4: Cloud Build config and first (manual) deploy

**Files:**
- Create: `cloudbuild.yaml`

**Interfaces:**
- Consumes: Artifact Registry repo `$REPO` and IAM bindings from Task 3; the `Dockerfile` from Task 2.
- Produces: a live Cloud Run service `$SERVICE` and a working `cloudbuild.yaml` — Task 5's trigger runs this same file.

- [ ] **Step 1: Write `cloudbuild.yaml`**

```yaml
substitutions:
  _REGION: asia-east1
  _REPO: web
  _SERVICE: hoang-nguyen-me

options:
  logging: CLOUD_LOGGING_ONLY

steps:
  - id: build
    name: gcr.io/cloud-builders/docker
    args:
      - build
      - -t
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_SERVICE}:$SHORT_SHA'
      - -t
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_SERVICE}:latest'
      - .

  - id: push
    name: gcr.io/cloud-builders/docker
    args:
      - push
      - --all-tags
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_SERVICE}'

  - id: deploy
    name: gcr.io/google.com/cloudsdktool/cloud-sdk
    entrypoint: gcloud
    args:
      - run
      - deploy
      - '${_SERVICE}'
      - '--image=${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_SERVICE}:$SHORT_SHA'
      - '--region=${_REGION}'
      - '--platform=managed'
      - '--port=8080'
      - '--allow-unauthenticated'
      - '--min-instances=0'
      - '--max-instances=2'
      - '--memory=256Mi'
```

> If `$REGION`/`$REPO`/`$SERVICE` differ from the defaults above, edit the three `substitutions` values to match.

- [ ] **Step 2: Commit the config**

```bash
git add cloudbuild.yaml
git commit -m "feat: add Cloud Build pipeline (build, push, deploy to Cloud Run)"
```

- [ ] **Step 3: Submit a manual build to validate the whole pipeline**

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION="$REGION",_REPO="$REPO",_SERVICE="$SERVICE" .
```
Expected: build `SUCCESS`; the `deploy` step prints a Cloud Run `Service URL` ending in `.run.app`.

- [ ] **Step 4: Verify the deployed service is live**

```bash
URL=$(gcloud run services describe "$SERVICE" --region="$REGION" --format='value(status.url)')
echo "$URL"
curl -sS -o /dev/null -w "%{http_code}\n" "$URL"
```
Expected: an `https://...run.app` URL and HTTP `200`.

---

### Task 5: Cloud Build GitHub trigger (auto-deploy on push)

No repo files change — this connects GitHub to Cloud Build and creates a trigger. Done in the GCP console + `gcloud`.

**Interfaces:**
- Consumes: the GitHub repo from Task 1 and `cloudbuild.yaml` from Task 4.
- Produces: automatic build+deploy on every push to `main`.

- [ ] **Step 1: Connect the GitHub repository (one-time, browser)**

In the GCP Console → Cloud Build → Repositories → **Connect Repository**, choose GitHub (Cloud Build GitHub App), authorize, and select `$GH_REPO`. (This OAuth handshake cannot be scripted headlessly.)

- [ ] **Step 2: Create the push-to-main trigger**

```bash
gcloud builds triggers create github \
  --name="deploy-main" \
  --repo-name="$(basename "$GH_REPO")" \
  --repo-owner="$(dirname "$GH_REPO")" \
  --branch-pattern='^main$' \
  --build-config="cloudbuild.yaml" \
  --substitutions=_REGION="$REGION",_REPO="$REPO",_SERVICE="$SERVICE"
```
Expected: `Created [deploy-main].`

- [ ] **Step 3: Trigger a deploy with a real push**

```bash
git commit --allow-empty -m "chore: verify Cloud Build trigger"
git push origin main
```

- [ ] **Step 4: Confirm the triggered build ran and succeeded**

```bash
gcloud builds list --limit=1 --format='table(id,status,createTime)'
```
Expected: one build with status `SUCCESS` created just now.

---

### Task 6: Map the custom domain

No repo files change — configures Cloud Run domain mapping + registrar DNS.

**Interfaces:**
- Consumes: the live Cloud Run service `$SERVICE` from Task 4.
- Produces: `https://$DOMAIN` serving the site with managed TLS.

- [ ] **Step 1: Verify domain ownership (one-time, if prompted)**

Run: `gcloud domains list-user-verified` — if `$DOMAIN` is not listed, run `gcloud domains verify "$DOMAIN"` and complete the console verification flow.

- [ ] **Step 2: Create the domain mapping**

```bash
gcloud beta run domain-mappings create \
  --service="$SERVICE" \
  --domain="$DOMAIN" \
  --region="$REGION"
```
Expected: command prints the DNS records (A/AAAA or CNAME) to add.

- [ ] **Step 3: Add the printed DNS records at your registrar**

Copy the exact record(s) from Step 2 into the DNS settings for `$DOMAIN`. (Manual, at whichever registrar holds the domain.)

- [ ] **Step 4: Wait for the certificate, then verify HTTPS**

```bash
gcloud beta run domain-mappings describe --domain="$DOMAIN" --region="$REGION" \
  --format='value(status.conditions[0].type,status.conditions[0].status)'
curl -sS -o /dev/null -w "%{http_code}\n" "https://$DOMAIN/"
```
Expected: mapping condition eventually `Ready True` (cert issuance can take minutes to an hour after DNS propagates), then HTTP `200` over HTTPS.

---

### Task 7: Deployment runbook

**Files:**
- Create: `docs/deployment.md`

**Interfaces:**
- Consumes: all prior tasks — documents the setup and the day-to-day flow.

- [ ] **Step 1: Write `docs/deployment.md`**

````markdown
# Deployment

The site is a static Astro build served by nginx in a container on Cloud Run.
Every push to `main` triggers a Cloud Build that builds the image, pushes it to
Artifact Registry (tagged by commit SHA), and deploys it.

## Day-to-day: ship a change

1. Edit content/code. For blog posts, run `npm run cms` locally to use the
   Decap CMS, or edit `src/content/blog/*` directly.
2. Commit and push to `main`:
   ```bash
   git add -A && git commit -m "..." && git push origin main
   ```
3. Cloud Build builds and deploys automatically. Watch it:
   ```bash
   gcloud builds list --limit=1
   ```

## Configuration

| Value | Where |
| --- | --- |
| Region | `cloudbuild.yaml` substitutions `_REGION` |
| Artifact Registry repo | `_REPO` |
| Cloud Run service | `_SERVICE` |
| Container port | `nginx.conf` `listen 8080` + `--port=8080` |

## Test the container locally

```bash
docker build -t hoang-nguyen-me:local .
docker run --rm -p 8080:8080 hoang-nguyen-me:local
# open http://localhost:8080
```

## Roll back

Images are tagged by commit SHA. Redeploy an older one:

```bash
gcloud run deploy "$SERVICE" \
  --image="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE:<OLD_SHORT_SHA>" \
  --region="$REGION"
```

## One-time setup

See `docs/superpowers/plans/2026-07-19-docker-gcp-deployment.md` (Tasks 3, 5, 6)
for project creation, API enablement, IAM, the GitHub trigger, and the custom
domain mapping.

## Notes

- Decap CMS `/admin` ships as static files but has no production auth backend
  (`git-gateway` needs Netlify Identity). Content editing is local-only.
````

- [ ] **Step 2: Commit**

```bash
git add docs/deployment.md
git commit -m "docs: add deployment runbook"
```

---

## Self-Review

**Spec coverage:**
- Cloud Run target → Tasks 3–4. ✓
- Multi-stage Docker build → Task 2. ✓
- nginx behavior (PORT 8080, clean URLs, caching, gzip, 404) → Task 2 Steps 2–6. ✓
- Cloud Build trigger on `main` → Task 5. ✓
- GitHub source repo → Task 1. ✓
- Artifact Registry + SHA tagging + IAM → Tasks 3–4. ✓
- Custom domain mapping + managed TLS → Task 6. ✓
- Files added (Dockerfile, nginx.conf, .dockerignore, cloudbuild.yaml, docs/deployment.md) → Tasks 2, 4, 7. ✓
- Verification strategy (local docker run, run.app check, domain check) → Tasks 2, 4, 6. ✓
- CMS local-only note → Tasks 2 (admin loads) and 7 (documented). ✓

**Placeholder scan:** No TBD/TODO. `$PROJECT_ID`, `$DOMAIN`, `$GH_REPO`, region are user-specific values defined and exported in Global Constraints, not placeholders.

**Type/name consistency:** `_REGION`/`_REPO`/`_SERVICE` substitution names, the image path `${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/${_SERVICE}`, port `8080`, and service name `$SERVICE` are identical across `nginx.conf`, `Dockerfile`, `cloudbuild.yaml`, the trigger, and the runbook. ✓
