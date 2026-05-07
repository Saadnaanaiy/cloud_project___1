# Disaster Recovery Runbook

## Scenario: Complete GKE Cluster Loss

**Trigger:** GKE cluster deleted, corrupted, or unavailable for >30 minutes  
**RTO (Recovery Time Objective):** 20-30 minutes  
**RPO (Recovery Point Objective):** 24 hours (last MySQL backup)

---

## Phase 1: Assessment (2 min)

```bash
# Check if cluster is reachable
gcloud container clusters list --project=cloudappproject-494314 --region=europe-west1

# If cluster is listed but unresponsive:
gcloud container clusters get-credentials dev-employee-gke \
  --region=europe-west1 --project=cloudappproject-494314
kubectl get nodes

# If cluster is deleted:
echo "CLUSTER DELETED — proceeding with rebuild"
```

---

## Phase 2: Infrastructure Rebuild (10-15 min)

```bash
# 1. Authenticate
gcloud auth login
gcloud config set project cloudappproject-494314

# 2. Enable required APIs
gcloud services enable \
  container.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com

# 3. Rebuild infrastructure with Terraform
make tf-init
make tf-plan    # Review changes
make tf-apply   # ~10-15 minutes

# 4. Get cluster credentials
make gke-login

# 5. Verify cluster
kubectl get nodes
kubectl cluster-info
```

---

## Phase 3: Application Deployment (5 min)

```bash
# 1. Install add-ons (cert-manager + NGINX Ingress)
make addons-install

# 2. Get LoadBalancer IP and update DuckDNS
make k8s-lb-ip
# Update DuckDNS with the new IP

# 3. Deploy application
make k8s-deploy

# 4. Wait for rollout
kubectl rollout status deployment/backend -n employee-platform --timeout=180s
kubectl rollout status deployment/frontend -n employee-platform --timeout=180s

# 5. Verify SSL certificate
make k8s-ssl-status
# Wait for Ready=True (~2-5 minutes)
```

---

## Phase 4: Database Recovery (3 min)

```bash
# 1. Check if MySQL is running
kubectl get pods -n employee-platform -l app=mysql

# 2. Get backup file from PVC
BACKUP_POD=$(kubectl get pod -l job-name=mysql-backup -n employee-platform \
  -o jsonpath='{.items[-1].metadata.name}' 2>/dev/null || echo "")

# 3. If backup exists, restore it
kubectl exec -it mysql-0 -n employee-platform -- \
  bash -c "mysql -u root -p'\$MYSQL_ROOT_PASSWORD' \$MYSQL_DATABASE < /backups/latest_backup.sql"

# 4. Verify data
kubectl exec -it mysql-0 -n employee-platform -- \
  mysql -u root -p'\$MYSQL_ROOT_PASSWORD' -e "USE employee_platform; SELECT COUNT(*) FROM employees;"
```

---

## Phase 5: Monitoring & Validation (2 min)

```bash
# 1. Install monitoring
make monitoring-install

# 2. Apply Grafana dashboard
kubectl apply -f k8s/13-grafana-dashboard.yaml
kubectl apply -f k8s/08-monitoring-ingress.yaml

# 3. Verify all pods are running
kubectl get pods -n employee-platform
kubectl get pods -n monitoring

# 4. Test application
curl -s https://empmanager.duckdns.org/api/health | jq .

# 5. Check SSL
curl -sI https://empmanager.duckdns.org | grep -i "strict-transport"
```

---

## Phase 6: Post-Recovery Checklist

- [ ] Application accessible at https://empmanager.duckdns.org
- [ ] SSL certificate valid (Ready=True)
- [ ] All pods Running (0 Restarting/CrashLoopBackOff)
- [ ] MySQL data restored (or confirmed empty with seed data)
- [ ] Grafana dashboard showing metrics
- [ ] Alert rules active in Prometheus
- [ ] DNS (DuckDNS) pointing to correct LoadBalancer IP
- [ ] CI/CD pipeline functional (push to main → auto-deploy)

---

## Common Failure Modes

| Issue | Fix |
|-------|-----|
| Terraform state lock | `cd infrastructure && terraform force-unlock <LOCK_ID>` |
| cert-manager not issuing certs | `kubectl logs -n cert-manager deploy/cert-manager` |
| MySQL PVC lost | Restore from external backup or re-seed |
| LoadBalancer IP changed | Update DuckDNS, wait for DNS propagation |
| Artifact Registry images missing | Re-push with `make push-images` |

---

## Automated Recovery Script

```bash
# Full automated recovery (after gcloud auth)
bash scripts/full-recovery.sh
```

This script runs all phases automatically. Run it for quick recovery during demos.
