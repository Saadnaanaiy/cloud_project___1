#!/bin/bash
# ============================================================
# deploy.sh — Script de Déploiement Complet
# Employee Management Platform → GKE + HTTPS
# ============================================================
# Usage: bash scripts/deploy.sh
# ============================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

info()    { local msg="$1"; echo -e "${BLUE}ℹ️  ${msg}${NC}"; }
success() { local msg="$1"; echo -e "${GREEN}✅ ${msg}${NC}"; }
warning() { local msg="$1"; echo -e "${YELLOW}⚠️  ${msg}${NC}"; }
error()   { local msg="$1"; echo -e "${RED}❌ ${msg}${NC}"; exit 1; }
step()    { local msg="$1"; echo -e "\n${CYAN}══════════════════════════════════════${NC}"; echo -e "${CYAN}  STEP ${msg}${NC}"; echo -e "${CYAN}══════════════════════════════════════${NC}"; }

# ─── Configuration ───────────────────────────────────────────
PROJECT_ID="cloudappproject-494314"
REGION="europe-west1"
CLUSTER="dev-employee-gke"
REGISTRY="europe-west1-docker.pkg.dev"
REPO="dev-employee-platform"
NAMESPACE="employee-platform"
DOMAIN="empmanager.duckdns.org"
IMAGE_TAG=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")

echo -e "${CYAN}"
cat << 'EOF'
  ╔═══════════════════════════════════════════╗
  ║   Employee Platform — Full Deployment     ║
  ║   Target: GKE + HTTPS (Let's Encrypt)     ║
  ╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

info "Project: $PROJECT_ID"
info "Domain:  https://$DOMAIN"
info "Tag:     $IMAGE_TAG"
echo ""

# ─── Check Prerequisites ─────────────────────────────────────
step "0 — Checking prerequisites"
for cmd in gcloud kubectl helm docker; do
  if command -v $cmd &>/dev/null; then
    success "$cmd is installed"
  else
    error "$cmd is not installed. Please install it first."
  fi
done

# ─── GCP Auth ────────────────────────────────────────────────
step "1 — Authenticating to GCP"
gcloud config set project $PROJECT_ID
gcloud container clusters get-credentials $CLUSTER \
  --region=$REGION --project=$PROJECT_ID
success "GKE credentials configured"

# ─── Build & Push Images ─────────────────────────────────────
step "2 — Building & Pushing Docker Images"
gcloud auth configure-docker $REGISTRY --quiet

info "Building backend..."
docker build \
  -t $REGISTRY/$PROJECT_ID/$REPO/backend:$IMAGE_TAG \
  -t $REGISTRY/$PROJECT_ID/$REPO/backend:latest \
  ./backend

info "Building frontend (API URL: https://$DOMAIN)..."
docker build \
  --build-arg VITE_API_URL=https://$DOMAIN \
  -t $REGISTRY/$PROJECT_ID/$REPO/frontend:$IMAGE_TAG \
  -t $REGISTRY/$PROJECT_ID/$REPO/frontend:latest \
  ./frontend

info "Pushing images..."
docker push $REGISTRY/$PROJECT_ID/$REPO/backend:$IMAGE_TAG
docker push $REGISTRY/$PROJECT_ID/$REPO/backend:latest
docker push $REGISTRY/$PROJECT_ID/$REPO/frontend:$IMAGE_TAG
docker push $REGISTRY/$PROJECT_ID/$REPO/frontend:latest
success "Images pushed (tag: $IMAGE_TAG)"

# ─── Install Add-ons ─────────────────────────────────────────
step "3 — Installing Kubernetes Add-ons"

# cert-manager
if ! helm list -n cert-manager 2>/dev/null | grep -q cert-manager; then
  info "Installing cert-manager..."
  helm repo add jetstack https://charts.jetstack.io --force-update
  helm upgrade --install cert-manager jetstack/cert-manager \
    --namespace cert-manager --create-namespace \
    --set crds.enabled=true --wait
  success "cert-manager installed"
else
  info "cert-manager already installed — skipping"
fi

# NGINX Ingress
if ! helm list -n ingress-nginx 2>/dev/null | grep -q nginx-ingress; then
  info "Installing NGINX Ingress Controller..."
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx --force-update
  helm upgrade --install nginx-ingress ingress-nginx/ingress-nginx \
    --namespace ingress-nginx --create-namespace \
    --set controller.service.type=LoadBalancer --wait
  success "NGINX Ingress installed"
else
  info "NGINX Ingress already installed — skipping"
fi

# ─── Get LB IP ───────────────────────────────────────────────
step "4 — Getting LoadBalancer IP"
info "Waiting for LoadBalancer IP (may take up to 60s)..."
LB_IP=""
for i in {1..12}; do
  LB_IP=$(kubectl get svc nginx-ingress-ingress-nginx-controller \
    -n ingress-nginx \
    -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  if [[ -n "$LB_IP" ]]; then break; fi
  echo "  Attempt $i/12 — waiting 10s..."
  sleep 10
done

if [[ -z "$LB_IP" ]]; then
  error "Could not get LoadBalancer IP. Check: kubectl get svc -n ingress-nginx"
fi

success "LoadBalancer IP: $LB_IP"
echo ""
warning "ACTION REQUIRED:"
echo "  → Go to https://www.duckdns.org"
echo "  → Set domain 'empmanager' to IP: $LB_IP"
echo "  → Wait 30s for DNS to propagate"
echo ""
read -p "Press ENTER when DuckDNS is updated..."

# ─── Deploy Application ───────────────────────────────────────
step "5 — Deploying Application to GKE"

kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-configmap.yaml
kubectl apply -f k8s/03-mysql.yaml

info "Waiting for MySQL to be ready..."
kubectl rollout status statefulset/mysql -n $NAMESPACE --timeout=180s

kubectl apply -f k8s/04-backend.yaml
kubectl apply -f k8s/05-frontend.yaml

info "Waiting for backend..."
kubectl rollout status deployment/backend -n $NAMESPACE --timeout=180s
info "Waiting for frontend..."
kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=120s

# ─── SSL Setup ───────────────────────────────────────────────
step "6 — Configuring SSL (Let's Encrypt)"
kubectl apply -f k8s/07-cert-manager-issuer.yaml
kubectl apply -f k8s/06-ingress.yaml

info "Waiting for SSL certificate (2-5 minutes)..."
for i in {1..30}; do
  STATUS=$(kubectl get certificate employee-tls -n $NAMESPACE \
    -o jsonpath='{.status.conditions[0].status}' 2>/dev/null || echo "False")
  if [[ "$STATUS" == "True" ]]; then
    success "SSL Certificate issued! ✅"
    break
  fi
  echo "  Attempt $i/30 — certificate pending... ($(date +%H:%M:%S))"
  sleep 10
done

# ─── Summary ─────────────────────────────────────────────────
step "7 — Deployment Complete!"

echo ""
success "Application deployed successfully!"
echo ""
echo -e "  🌐 ${GREEN}https://$DOMAIN${NC}"
echo ""
echo "  📊 Resources:"
kubectl get all -n $NAMESPACE
echo ""
echo "  🔒 SSL Status:"
kubectl get certificate -n $NAMESPACE 2>/dev/null || true
echo ""
echo "  Next steps:"
echo "    → Install monitoring:  make monitoring-install"
echo "    → Run load tests:      make load-test-k8s"
echo "    → View logs:           make k8s-logs-backend"
