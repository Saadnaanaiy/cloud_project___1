#!/bin/bash
# ============================================================
# Full Automated Recovery Script
# Rebuilds entire infrastructure from scratch
# Run after: gcloud auth login && gcloud config set project cloudappproject-494314
# ============================================================

set -e

echo "============================================"
echo " FULL PLATFORM RECOVERY"
echo " Starting at: $(date)"
echo "============================================"

# Phase 1: Infrastructure
echo -e "\n[Phase 1] Rebuilding infrastructure..."
make tf-init
make tf-apply -var="auto_approve=true" || make tf-apply
make gke-login

# Phase 2: Add-ons
echo -e "\n[Phase 2] Installing add-ons..."
make addons-install
echo "Waiting 30s for LoadBalancer..."
sleep 30
LB_IP=$(make k8s-lb-ip)
echo "LoadBalancer IP: ${LB_IP}"
echo "Update DuckDNS with this IP!"

# Phase 3: Deploy
echo -e "\n[Phase 3] Deploying application..."
make k8s-deploy

# Phase 4: Wait for rollout
echo -e "\n[Phase 4] Waiting for pods..."
kubectl rollout status deployment/backend -n employee-platform --timeout=180s
kubectl rollout status deployment/frontend -n employee-platform --timeout=180s

# Phase 5: SSL
echo -e "\n[Phase 5] Checking SSL..."
for i in {1..10}; do
  STATUS=$(kubectl get certificate employee-tls -n employee-platform -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "")
  if [ "${STATUS}" = "True" ]; then
    echo "SSL certificate is Ready!"
    break
  fi
  echo "Waiting for SSL... (${i}/10)"
  sleep 30
done

# Phase 6: Monitoring
echo -e "\n[Phase 6] Installing monitoring..."
make monitoring-install
kubectl apply -f k8s/13-grafana-dashboard.yaml 2>/dev/null || true
kubectl apply -f k8s/08-monitoring-ingress.yaml 2>/dev/null || true

# Verification
echo -e "\n============================================"
echo " VERIFICATION"
echo "============================================"
echo "Pods:"
kubectl get pods -n employee-platform
echo -e "\nServices:"
kubectl get svc -n employee-platform
echo -e "\nIngress:"
kubectl get ingress -n employee-platform
echo -e "\nSSL:"
kubectl get certificate -n employee-platform
echo -e "\nHealth check:"
curl -s https://empmanager.duckdns.org/api/health || echo "Health check failed (may need DNS propagation)"
echo -e "\n============================================"
echo " RECOVERY COMPLETE"
echo " Finished at: $(date)"
echo "============================================"
