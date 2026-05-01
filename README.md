# 🚀 Employee Management Platform — Cloud Native on GCP
<!-- Deployment Version: 1.0.2-turnstile-fix -->

> **Plateforme Cloud Native** déployée sur Google Kubernetes Engine (GKE) avec CI/CD automatique, SSL gratuit, et monitoring Prometheus/Grafana.

🌐 **Live URL :** [https://empmanager.duckdns.org](https://empmanager.duckdns.org)

---

## 🏗️ Architecture

```
Internet → DuckDNS (empmanager.duckdns.org)
              ↓
        GCP Load Balancer
              ↓
      NGINX Ingress Controller (GKE)
        ↙             ↘
   /api/*          /  (root)
 backend:3001   frontend:80
       ↓
  MySQL StatefulSet
```

**Stack :**
- **Frontend :** React + TypeScript (Vite) — servi par Nginx
- **Backend :** NestJS (Node.js) — API REST + WebSocket (Socket.IO)
- **Database :** MySQL 8.0 (StatefulSet avec PVC 10Gi)
- **Ingress :** NGINX Ingress Controller
- **SSL :** cert-manager + Let's Encrypt (gratuit, auto-renouvelé)
- **Infrastructure :** Terraform → GKE (GCP europe-west1)
- **CI/CD :** GitHub Actions (Workload Identity Federation)
- **Monitoring :** Prometheus + Grafana (kube-prometheus-stack)

---

## 📋 Prérequis

| Outil | Version | Installation |
|-------|---------|-------------|
| `gcloud` CLI | latest | [cloud.google.com/sdk](https://cloud.google.com/sdk) |
| `terraform` | >= 1.6 | [terraform.io](https://www.terraform.io) |
| `kubectl` | >= 1.28 | `gcloud components install kubectl` |
| `helm` | >= 3.14 | [helm.sh](https://helm.sh) |
| `docker` | >= 24 | [docker.com](https://www.docker.com) |
| `make` | any | Windows: `winget install GnuWin32.Make` |

---

## 🚀 Guide de Déploiement Complet

### ÉTAPE 0 — Préparation locale

```bash
# Cloner le projet
git clone https://github.com/YOUR_USERNAME/cloud_project.git
cd cloud_project

# Copier les fichiers d'environnement
cp .env.example .env
cp backend/.env.example backend/.env

# Tester localement avec Docker Compose
make up
# → Frontend: http://localhost:5173
# → Backend:  http://localhost:3001
# → API Docs: http://localhost:3001/api
make down
```

---

### ÉTAPE 1 — Créer le domaine DuckDNS gratuit

1. Aller sur **[https://www.duckdns.org](https://www.duckdns.org)**
2. Se connecter avec Google/GitHub
3. Dans "Add domain" → taper `empmanager` → cliquer **add domain**
4. Garder la page ouverte (on y reviendra pour l'IP)

**Votre domaine :** `empmanager.duckdns.org` ✅

---

### ÉTAPE 2 — Configurer GCP

```bash
# S'authentifier
gcloud auth login
gcloud auth application-default login
gcloud config set project cloudappproject-494314

# Activer les APIs nécessaires
gcloud services enable \
  container.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  storage.googleapis.com

# Créer le bucket GCS pour le state Terraform
gcloud storage buckets create gs://cloudappproject-494314-tf-state \
  --location=europe-west1 \
  --uniform-bucket-level-access
```

---

### ÉTAPE 3 — Déployer l'Infrastructure avec Terraform

```bash
# Configurer le backend Terraform
cat > infrastructure/backend.hcl << EOF
bucket = "cloudappproject-494314-tf-state"
prefix = "terraform/state"
EOF

# ⚠️ IMPORTANT: Éditer workload_identity.tf
# Remplacer YOUR_GITHUB_USERNAME par votre vrai username GitHub

# Initialiser et appliquer
make tf-init
make tf-plan    # Vérifier le plan
make tf-apply   # Déployer (~10-15 minutes)

# Voir les outputs (WIF values pour GitHub Secrets)
make tf-output
```

**Ce que Terraform crée :**
- ✅ VPC `dev-cloud-native-vpc` + Subnet privé
- ✅ Cloud Router + Cloud NAT
- ✅ Cluster GKE `dev-employee-gke` (privé)
- ✅ Artifact Registry `dev-employee-platform`
- ✅ Service Account GitHub Actions + Workload Identity

---

### ÉTAPE 4 — Configurer GitHub Secrets

Dans votre repo GitHub → **Settings → Secrets and variables → Actions** :

| Secret | Valeur |
|--------|--------|
| `WIF_PROVIDER` | Output de `terraform output wif_provider` |
| `WIF_SERVICE_ACCOUNT` | Output de `terraform output wif_service_account` |
| `VITE_RECAPTCHA_SITE_KEY` | Votre clé reCAPTCHA site |

---

### ÉTAPE 5 — Récupérer les credentials GKE

```bash
make gke-login
# Cela configure kubectl pour pointer vers votre cluster GKE
```

---

### ÉTAPE 6 — Installer les add-ons Kubernetes

```bash
# Installe cert-manager (SSL) + NGINX Ingress Controller
make addons-install

# Récupérer l'IP du Load Balancer
make k8s-lb-ip
# Exemple output: 34.78.123.45
```

**→ Retourner sur DuckDNS et mettre cette IP dans votre domaine `empmanager` !**

---

### ÉTAPE 7 — Éditer les Secrets K8s

```bash
# ⚠️ AVANT de déployer, changer les mots de passe dans k8s/01-secrets.yaml !
# Remplacer "changeme-*" par de vrais secrets sécurisés

# Option recommandée : générer des secrets forts
openssl rand -base64 32  # Pour DB_PASSWORD
openssl rand -base64 64  # Pour JWT_SECRET
```

---

### ÉTAPE 8 — Pusher les images Docker

```bash
make push-images
# Build backend + frontend, push vers Artifact Registry
```

---

### ÉTAPE 9 — Déployer l'application

```bash
# Appliquer tous les manifests K8s dans l'ordre
make k8s-deploy

# Vérifier que tout est Running
make k8s-status

# Vérifier le certificat SSL
make k8s-ssl-status
# → Ready=True signifie que HTTPS fonctionne !
```

**⏳ Le certificat SSL prend 2-5 minutes à être émis par Let's Encrypt.**

---

### ÉTAPE 10 — Installer le Monitoring

```bash
make monitoring-install

# Appliquer l'Ingress Grafana
kubectl apply -f k8s/08-monitoring-ingress.yaml

# Accéder à Grafana
# → https://empmanager.duckdns.org/grafana
# Login: admin / Admin123!
```

---

### ÉTAPE 11 — CI/CD Automatique

Maintenant que tout est configuré, le pipeline est **entièrement automatique** :

```
git push origin main
    ↓
GitHub Actions CI: lint → build → trivy scan → push image
    ↓ (si CI passe)
GitHub Actions CD: deploy to GKE → wait rollout → verify SSL
    ↓
https://empmanager.duckdns.org ✅ mis à jour !
```

---

### ÉTAPE 12 — Tests de Charge

```bash
# Installer k6
winget install k6 --source winget    # Windows
# ou: brew install k6                # Mac

# Lancer le test de charge sur la prod
make load-test-k8s
# Simule 50 utilisateurs simultanés pendant 3 minutes
# Résultats sauvegardés dans tests/load-test-results.json
```

---

## 🔐 Sécurité

| Mesure | Statut |
|--------|--------|
| HTTPS Let's Encrypt | ✅ Auto-renouvelé |
| HTTP → HTTPS redirect | ✅ Forcé via NGINX |
| Cluster GKE privé | ✅ Nodes sans IP publique |
| Workload Identity (no JSON keys) | ✅ CI/CD sécurisé |
| Non-root containers | ✅ appuser dans Dockerfile |
| Trivy scan en CI | ✅ Bloque si CRITICAL |
| Secrets en dehors du code | ⚠️ Utiliser GCP Secret Manager en prod |

---

## 📊 Commandes Utiles

```bash
make help                # Voir toutes les commandes
make k8s-status          # État des pods
make k8s-ssl-status      # État du certificat SSL
make k8s-logs-backend    # Logs backend en temps réel
make k8s-lb-ip           # IP du Load Balancer
make grafana-portforward # Ouvrir Grafana localement
make scan-images         # Scanner les vulnérabilités
```

---

## 📁 Structure du Projet

```
cloud_project/
├── backend/               # NestJS API
│   ├── src/
│   ├── Dockerfile         # Multi-stage build
│   └── .env.example
├── frontend/              # React + TypeScript
│   ├── src/
│   ├── nginx.conf         # SPA + proxy config
│   └── Dockerfile
├── k8s/                   # Kubernetes manifests
│   ├── 00-namespace.yaml
│   ├── 01-secrets.yaml
│   ├── 02-configmap.yaml
│   ├── 03-mysql.yaml      # StatefulSet + PVC
│   ├── 04-backend.yaml    # Deployment + HPA
│   ├── 05-frontend.yaml   # Deployment + HPA
│   ├── 06-ingress.yaml    # NGINX + TLS
│   ├── 07-cert-manager-issuer.yaml  # Let's Encrypt
│   └── 08-monitoring-ingress.yaml   # Grafana
├── infrastructure/        # Terraform IaC
│   ├── network.tf         # VPC + Subnet + NAT
│   ├── gke.tf             # GKE cluster
│   ├── artifact_registry.tf
│   ├── workload_identity.tf  # GitHub Actions auth
│   └── variables.tf
├── ansible/               # Configuration automation
│   ├── inventory.yml
│   ├── configure-bastion.yml
│   └── install-k8s-addons.yml
├── .github/workflows/     # CI/CD Pipelines
│   ├── ci.yml             # Build + scan + push
│   ├── cd.yml             # Deploy to GKE
│   └── terraform.yml      # Infrastructure changes
├── tests/
│   └── load-test.js       # k6 load test
├── docker-compose.yml     # Local development
└── Makefile               # All commands
```

---

## 🆘 Troubleshooting

### SSL certificate not issued
```bash
kubectl describe certificate employee-tls -n employee-platform
kubectl logs -n cert-manager deploy/cert-manager | tail -50
# Vérifier que DuckDNS pointe bien vers l'IP du LB
```

### Pod CrashLoopBackOff
```bash
make k8s-logs-backend
kubectl describe pod -l app=backend -n employee-platform
```

### Cannot connect to GKE cluster
```bash
make gke-login
kubectl cluster-info
```
