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
| Region | `cloudbuild.yaml` substitution `_REGION` |
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

The full one-time provisioning (project, APIs, IAM, GitHub trigger, custom
domain) is documented as a runbook in
`docs/superpowers/plans/2026-07-19-docker-gcp-deployment.md`, Tasks 3, 5, and 6.
A condensed version:

```bash
# Variables (substitute real values)
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export REPO="web"
export SERVICE="hoang-nguyen-me"
export DOMAIN="hoang-nguyen.me"

# 1. Enable APIs
gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 2. Create the Artifact Registry Docker repo
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker --location="$REGION"

# 3. Grant the Cloud Build service account deploy permissions
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
gcloud iam service-accounts add-iam-policy-binding \
  "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 4. First deploy (validates the pipeline before wiring the trigger)
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION="$REGION",_REPO="$REPO",_SERVICE="$SERVICE" .

# 5. Connect the GitHub repo in the console (Cloud Build > Repositories),
#    then create the push-to-main trigger:
gcloud builds triggers create github \
  --name="deploy-main" --repo-owner="hoanghonn" --repo-name="hoangnguyen.me" \
  --branch-pattern='^main$' --build-config="cloudbuild.yaml" \
  --substitutions=_REGION="$REGION",_REPO="$REPO",_SERVICE="$SERVICE"

# 6. Map the custom domain, then add the printed DNS records at your registrar
gcloud beta run domain-mappings create \
  --service="$SERVICE" --domain="$DOMAIN" --region="$REGION"
```

## Notes

- Decap CMS `/admin` ships as static files but has no production auth backend
  (`git-gateway` needs Netlify Identity). Content editing is local-only: edit
  locally, commit, push, and Cloud Build redeploys.
