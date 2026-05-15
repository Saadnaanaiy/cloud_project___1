# Session Log — 11 May 2026

## Changes Made

### 1. Live Security Log Viewer (WebSocket)
- Created `backend/src/audit/audit.gateway.ts` — Socket.IO gateway at `/ws/audit/`
  - JWT-authenticated, admin-only connections
  - Emits `newAuditLog` event in real-time
- Modified `audit.service.ts` — broadcasts each log after saving to DB
- Modified `audit.module.ts` — registered `AuditGateway`
- Updated `frontend/src/pages/SecurityLogsPage.tsx`:
  - Connects to `/ws/audit/` via Socket.IO on mount
  - Listens for `newAuditLog` events and prepends them live
  - Shows green **LIVE** indicator with pulsing dot when connected
- Added `@keyframes pulse` to `frontend/src/index.css`

### 2. Removed Unused Mail Notification System
- Deleted `backend/src/notifications/` (service + module) — was dead code
- Removed `NotificationsModule` from `app.module.ts`
- Removed `nodemailer` + `@types/nodemailer` from `package.json`
- Removed SMTP env vars from `.env.example`

### 3. Helmet.js Security Headers
- Installed `helmet` package
- Added `app.use(helmet())` in `backend/src/main.ts`
- Adds X-Content-Type-Options, X-Frame-Options, HSTS, CSP, etc.

### 4. Fixed CI Failures
- Fixed `employees.controller.spec.ts` — added missing `userId` args to controller calls
- Fixed `employees.service.spec.ts` — added missing `userId` args to service calls
- Fixed `SecurityLogsPage.tsx` — removed unused `User` import, added `color` prop to icon type
- Fixed `AnnouncementsPage.tsx` — added `htmlFor` + `id` to all 4 form labels (accessibility)

### 5. Fixed CD Pipeline Race Condition
- Modified `.github/workflows/cd.yml` line 110:
  - Changed `git push origin main` → `git pull --rebase origin main && git push origin main`
  - Prevents push failures when remote has new commits

### 6. Fixed ArgoCD DNS Issue
- Updated `k8s/15-argocd-app.yaml`: `targetRevision: HEAD` → `targetRevision: main`
- Patched CoreDNS ConfigMap to use Google DNS (8.8.8.8, 8.8.4.4) instead of `/etc/resolv.conf`
- Restarted CoreDNS pods

### 7. Deleted Load Balancer / Ingress to Save Costs
- Deleted `employee-ingress` from the cluster to stop the GCP Load Balancer (~$0.60/day)
- The ingress YAML is saved in the repo at `k8s/06-ingress.yaml`

### 8. Stopped GKE Cluster to Save Costs
- Resized node pool `dev-cloud-native-node-pool` to 0 nodes

---

## Complete Project Structure

```
├── backend/           NestJS API (TypeScript)
├── frontend/          React SPA (TypeScript, Vite, Tailwind)
├── k8s/               Kubernetes manifests (17 files)
├── infrastructure/    Terraform IaC for GCP
├── .github/workflows/ CI/CD pipelines
├── docs/              Documentation
└── terraform/         GCP infrastructure as code
```

---

## How to Restart Everything for Soutenance (27/06/2026)

### Prerequisites
- Google Cloud SDK installed
- Access to `cloudappproject-494314` project
- This git repo cloned

### Step 1: Start the GKE node pool
```bash
gcloud container clusters resize dev-cloud-native-employee-gke \
  --node-pool=dev-cloud-native-node-pool \
  --num-nodes=2 \
  --region=europe-west1 \
  --project=cloudappproject-494314
```

### Step 2: Get kubectl access
```bash
gcloud container clusters get-credentials dev-cloud-native-employee-gke \
  --region=europe-west1 --project=cloudappproject-494314
```

### Step 3: Recreate the Ingress / Load Balancer
The ingress YAML is saved in `k8s/06-ingress.yaml`. Apply it:
```bash
kubectl apply -f k8s/06-ingress.yaml
```
This recreates the HTTPS load balancer + SSL certificate via cert-manager.
Wait ~2 minutes for the SSL cert to provision.

### Step 4: Wait for ArgoCD to sync
Auto-sync is enabled with `targetRevision: main`. Wait ~3 minutes.

If it doesn't auto-sync, force a refresh:
```bash
kubectl patch application employee-platform -n argocd --type=merge \
  -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```

### Step 5: Verify everything is running
```bash
kubectl get pods -n employee-platform
kubectl get pods -n argocd
kubectl get ingress -n employee-platform
```

### Step 6: Access the application
| Service | URL |
|---------|-----|
| **Main App** | https://empmanager.duckdns.org |
| **API Docs** | https://empmanager.duckdns.org/docs |
| **ArgoCD** | https://empmanager.duckdns.org/argocd |
| **Grafana** | https://empmanager.duckdns.org/grafana |

### Default Users
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | (from env `DEFAULT_ADMIN_PASSWORD`) |
| HR | hr@company.com | (from env `DEFAULT_HR_PASSWORD`) |
| Manager | manager@company.com | (from env `DEFAULT_MANAGER_PASSWORD`) |

> Passwords are stored in GCP Secret Manager, not in the repo.

### If ArgoCD doesn't sync
The ArgoCD app points to `targetRevision: main` (branch). If sync fails:
1. Check the error in ArgoCD UI → "APP CONDITIONS"
2. Common issue: CoreDNS can't resolve external DNS
3. Fix CoreDNS if needed:
   ```bash
   kubectl patch configmap coredns -n kube-system --type=merge \
     -p '{"data":{"Corefile":".:53 {\n    errors\n    health\n    ready\n    kubernetes cluster.local in-addr.arpa ip6.arpa {\n       pods insecure\n       fallthrough in-addr.arpa ip6.arpa\n       ttl 30\n    }\n    prometheus :9153\n    forward . 8.8.8.8 8.8.4.4 {\n       max_concurrent 1000\n    }\n    cache 30\n    loop\n    reload\n    loadbalance\n}"}}'
   kubectl delete pod -n kube-system -l k8s-app=kube-dns
   ```

### Certificate note
If cert-manager certificates expired while the cluster was stopped:
```bash
kubectl rollout restart deployment cert-manager -n cert-manager
```
SSL certificates auto-renew within ~5 minutes.

---

## Cost Summary (after deleting ingress)

| Period | Consumed | Remaining credits | Out of pocket |
|--------|----------|-------------------|---------------|
| Now (15 May) | $181 | $119 | $0 |
| 27 June | **~$183** | **~$117** | **$0** ✅ |

The ingress deletion saves enough to stay within the $300 free tier with zero out-of-pocket payment.

---

## Key Commits from This Session
```
e775a2c  — Add session log documenting all changes and restore instructions
d1027c8c — Round uptime value in health check
9586251  — Fix ArgoCD revision: use explicit branch 'main' instead of 'HEAD'
d10c26d7 — Fix remaining form label association for Publish Date field
9eefa60e — Fix 6 SonarCloud issues
65945ce3 — Add Helmet.js for HTTP security headers
00dfc68b — Fix SecurityLogsPage TS errors
36f6588  — Fix test files: add missing userId args
a10510d  — Add live security log viewer via WebSocket, remove unused mail notifications
```
