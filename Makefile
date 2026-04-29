# ============================================================
# 🚀 Cloud Native Platform — Makefile
# ============================================================
# Run `make help` to see all available commands
# ============================================================

.PHONY: help \
        build up down logs backend-logs frontend-logs db-logs \
        lint-backend lint-frontend test-backend \
        scan-backend scan-frontend scan-images \
        tf-init tf-plan tf-apply tf-destroy tf-output \
        gke-login push-images \
        k8s-namespace k8s-config k8s-deploy k8s-delete k8s-status \
        k8s-logs-backend k8s-logs-frontend k8s-ssl-status \
        addons-install monitoring-install monitoring-portforward grafana-portforward \
        load-test-local load-test-k8s

# Variables
PROJECT_ID  := cloudappproject-494314
REGION      := europe-west1
REGISTRY    := europe-west1-docker.pkg.dev
REPO        := dev-employee-platform
CLUSTER     := dev-employee-gke
NAMESPACE   := employee-platform
DOMAIN      := empmanager.duckdns.org
IMAGE_TAG   := $(shell git rev-parse --short HEAD 2>/dev/null || echo "latest")

# ─── Default ───────────────────────────────────────────────
help: ## Show this help message
	@echo ""
	@echo "  🚀 Cloud Native Platform — Command Reference"
	@echo "  Domain: https://$(DOMAIN)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-28s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Docker Compose (Local Dev) ────────────────────────────
build: ## Build all Docker images locally
	docker-compose build

up: ## Start all services locally (detached)
	docker-compose up -d

down: ## Stop and remove all containers + volumes
	docker-compose down -v

logs: ## Tail all container logs
	docker-compose logs -f

backend-logs: ## Tail backend logs
	docker-compose logs -f backend

frontend-logs: ## Tail frontend logs
	docker-compose logs -f frontend

db-logs: ## Tail database logs
	docker-compose logs -f db

# ─── Lint & Test ───────────────────────────────────────────
lint-backend: ## Lint backend TypeScript code
	cd backend && npm run lint

lint-frontend: ## Lint frontend React code
	cd frontend && npm run lint

test-backend: ## Run backend unit tests
	cd backend && npm test

# ─── Security Scanning (Trivy) ─────────────────────────────
scan-backend: ## Scan backend Docker image with Trivy
	docker build -t employee-backend-scan:local ./backend
	trivy image --severity HIGH,CRITICAL employee-backend-scan:local

scan-frontend: ## Scan frontend Docker image with Trivy
	docker build -t employee-frontend-scan:local ./frontend
	trivy image --severity HIGH,CRITICAL employee-frontend-scan:local

scan-images: scan-backend scan-frontend ## Scan ALL images with Trivy

# ─── GCP / Docker Push ─────────────────────────────────────
gke-login: ## Authenticate to GCP and get GKE credentials
	gcloud auth application-default login
	gcloud config set project $(PROJECT_ID)
	gcloud container clusters get-credentials $(CLUSTER) \
		--region=$(REGION) --project=$(PROJECT_ID)

docker-auth: ## Configure Docker to use Artifact Registry
	gcloud auth configure-docker $(REGISTRY) --quiet

push-images: docker-auth ## Build and push images to Artifact Registry
	@echo "🐳 Building and pushing backend (tag: $(IMAGE_TAG))..."
	docker build \
		-t $(REGISTRY)/$(PROJECT_ID)/$(REPO)/backend:$(IMAGE_TAG) \
		-t $(REGISTRY)/$(PROJECT_ID)/$(REPO)/backend:latest \
		./backend
	docker push $(REGISTRY)/$(PROJECT_ID)/$(REPO)/backend:$(IMAGE_TAG)
	docker push $(REGISTRY)/$(PROJECT_ID)/$(REPO)/backend:latest

	@echo "🐳 Building and pushing frontend (tag: $(IMAGE_TAG))..."
	docker build \
		--build-arg VITE_API_URL=https://$(DOMAIN) \
		-t $(REGISTRY)/$(PROJECT_ID)/$(REPO)/frontend:$(IMAGE_TAG) \
		-t $(REGISTRY)/$(PROJECT_ID)/$(REPO)/frontend:latest \
		./frontend
	docker push $(REGISTRY)/$(PROJECT_ID)/$(REPO)/frontend:$(IMAGE_TAG)
	docker push $(REGISTRY)/$(PROJECT_ID)/$(REPO)/frontend:latest
	@echo "✅ Images pushed! Tag: $(IMAGE_TAG)"

# ─── Terraform ─────────────────────────────────────────────
tf-init: ## Initialize Terraform with remote GCS backend
	cd infrastructure && terraform init \
		-backend-config="bucket=$(PROJECT_ID)-tf-state" \
		-backend-config="prefix=terraform/state"

tf-plan: ## Show Terraform execution plan
	cd infrastructure && terraform plan -var-file="terraform.tfvars"

tf-apply: ## Apply Terraform — provisions GCP infrastructure
	cd infrastructure && terraform apply -var-file="terraform.tfvars"

tf-destroy: ## DANGER: Destroy all Terraform infrastructure
	cd infrastructure && terraform destroy -var-file="terraform.tfvars"

tf-output: ## Show Terraform outputs (WIF values, cluster info)
	cd infrastructure && terraform output

# ─── Kubernetes — Deploy ────────────────────────────────────
k8s-deploy: ## Deploy ALL manifests to GKE (ordered)
	@echo "📦 Deploying to namespace: $(NAMESPACE)..."
	kubectl apply -f k8s/00-namespace.yaml
	kubectl apply -f k8s/01-secrets.yaml
	kubectl apply -f k8s/02-configmap.yaml
	kubectl apply -f k8s/03-mysql.yaml
	@echo "⏳ Waiting for MySQL..."
	kubectl rollout status statefulset/mysql -n $(NAMESPACE) --timeout=180s
	kubectl apply -f k8s/04-backend.yaml
	kubectl apply -f k8s/05-frontend.yaml
	kubectl apply -f k8s/07-cert-manager-issuer.yaml
	kubectl apply -f k8s/06-ingress.yaml
	@echo "✅ All manifests applied!"
	@echo "🌐 App will be live at: https://$(DOMAIN)"

k8s-update-images: ## Update running pods with the latest images (no downtime)
	kubectl set image deployment/backend \
		backend=$(REGISTRY)/$(PROJECT_ID)/$(REPO)/backend:$(IMAGE_TAG) \
		-n $(NAMESPACE)
	kubectl set image deployment/frontend \
		frontend=$(REGISTRY)/$(PROJECT_ID)/$(REPO)/frontend:$(IMAGE_TAG) \
		-n $(NAMESPACE)
	kubectl rollout status deployment/backend -n $(NAMESPACE)
	kubectl rollout status deployment/frontend -n $(NAMESPACE)

k8s-delete: ## Remove ALL Kubernetes resources
	kubectl delete -f k8s/ --ignore-not-found=true

k8s-status: ## Show all K8s resources in the namespace
	@echo "=== Pods ==="
	kubectl get pods -n $(NAMESPACE)
	@echo "\n=== Services ==="
	kubectl get svc -n $(NAMESPACE)
	@echo "\n=== Ingress ==="
	kubectl get ingress -n $(NAMESPACE)

k8s-ssl-status: ## Check SSL certificate status
	@echo "=== TLS Certificates ==="
	kubectl get certificate -n $(NAMESPACE)
	@echo "\n=== Certificate Requests ==="
	kubectl get certificaterequest -n $(NAMESPACE) 2>/dev/null || true
	@echo "\n=== cert-manager Events ==="
	kubectl get events -n $(NAMESPACE) --field-selector reason=Issued 2>/dev/null || true

k8s-logs-backend: ## Stream backend pod logs
	kubectl logs -l app=backend -n $(NAMESPACE) --tail=100 -f

k8s-logs-frontend: ## Stream frontend pod logs
	kubectl logs -l app=frontend -n $(NAMESPACE) --tail=100 -f

k8s-logs-mysql: ## Stream MySQL pod logs
	kubectl logs -l app=mysql -n $(NAMESPACE) --tail=50 -f

k8s-shell-backend: ## Open a shell in the backend pod
	kubectl exec -it -n $(NAMESPACE) \
		$(shell kubectl get pod -l app=backend -n $(NAMESPACE) -o jsonpath='{.items[0].metadata.name}') \
		-- sh

k8s-lb-ip: ## Get the NGINX Ingress LoadBalancer IP
	@kubectl get svc nginx-ingress-ingress-nginx-controller \
		-n ingress-nginx \
		-o jsonpath='{.status.loadBalancer.ingress[0].ip}' \
		2>/dev/null && echo "" || echo "❌ NGINX Ingress not found. Run: make addons-install"

# ─── Kubernetes Add-ons (cert-manager, NGINX, Prometheus) ──
addons-install: ## Install cert-manager + NGINX Ingress (Helm)
	@echo "📦 Installing cert-manager..."
	helm repo add jetstack https://charts.jetstack.io --force-update
	helm upgrade --install cert-manager jetstack/cert-manager \
		--namespace cert-manager --create-namespace \
		--set crds.enabled=true --wait
	@echo "📦 Installing NGINX Ingress Controller..."
	helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx --force-update
	helm upgrade --install nginx-ingress ingress-nginx/ingress-nginx \
		--namespace ingress-nginx --create-namespace \
		--set controller.service.type=LoadBalancer --wait
	@echo "✅ Add-ons installed!"
	@echo ""
	@echo "👉 Get your LoadBalancer IP with: make k8s-lb-ip"
	@echo "   Then set it in DuckDNS for domain: $(DOMAIN)"

monitoring-install: ## Install Prometheus + Grafana (kube-prometheus-stack)
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts --force-update
	helm upgrade --install kube-prometheus-stack \
		prometheus-community/kube-prometheus-stack \
		--namespace monitoring --create-namespace \
		--set grafana.adminPassword=Admin123! \
		--set prometheus.prometheusSpec.retention=15d \
		--wait --timeout=10m
	@echo "✅ Monitoring installed!"
	@echo "📊 Apply Grafana Ingress: kubectl apply -f k8s/08-monitoring-ingress.yaml"

grafana-portforward: ## Access Grafana locally at http://localhost:3000
	@echo "📊 Opening Grafana at http://localhost:3000 (admin/Admin123!)"
	kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n monitoring

# ─── Load Testing ──────────────────────────────────────────
load-test-local: ## Run k6 load test against LOCAL backend
	k6 run --env API_URL=http://localhost:3001 tests/load-test.js

load-test-k8s: ## Run k6 load test against PRODUCTION (GKE)
	k6 run --env API_URL=https://$(DOMAIN) tests/load-test.js
