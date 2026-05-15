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

### 7. Stopped GKE Cluster to Save Costs
- Resized node pool `dev-cloud-native-node-pool` to 0 nodes

---

## How to Restart Everything for Soutenance (27/06/2026)

### Step 1: Start the GKE node pool
```bash
gcloud container clusters resize dev-cloud-native-employee-gke \
  --node-pool=dev-cloud-native-node-pool \
  --num-nodes=2 \
  --region=europe-west1 \
  --project=cloudappproject-494314
```

### Step 2: Wait for nodes to be ready (2-3 minutes)
```bash
kubectl get nodes
```

### Step 3: Verify ArgoCD syncs automatically
The application has auto-sync enabled with `targetRevision: main`.
Wait ~3 minutes for ArgoCD to detect and sync.

If it doesn't auto-sync, force it:
```bash
kubectl patch application employee-platform -n argocd --type=merge \
  -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```

### Step 4: Verify everything is running
```bash
kubectl get pods -n employee-platform
kubectl get pods -n argocd
```

### Step 5: Access the application
- **App**: https://empmanager.duckdns.org
- **ArgoCD**: https://empmanager.duckdns.org/argocd (admin / password from `argocd-initial-admin-secret`)
- **API Docs**: https://empmanager.duckdns.org/docs

### Default Users
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | (from env DEFAULT_ADMIN_PASSWORD) |
| HR | hr@company.com | (from env DEFAULT_HR_PASSWORD) |
| Manager | manager@company.com | (from env DEFAULT_MANAGER_PASSWORD) |

### PostgreSQL Upgrade Note
If the cluster was stopped for a long time, cert-manager certificates may need renewal:
```bash
kubectl rollout restart deployment cert-manager -n cert-manager
kubectl delete pod -n kube-system -l k8s-app=kube-dns  # restart CoreDNS
```

---

## Key Commits
```
d1027c8c — Round uptime value in health check
9586251  — Fix ArgoCD revision: use explicit branch 'main' instead of 'HEAD'
d10c26d7 — Fix remaining form label association for Publish Date field
9eefa60e — Fix 6 SonarCloud issues
65945ce3 — Add Helmet.js for HTTP security headers
00dfc68b — Fix SecurityLogsPage TS errors
36f6588  — Fix test files: add missing userId args
a10510d  — Add live security log viewer via WebSocket, remove unused mail notifications
```
