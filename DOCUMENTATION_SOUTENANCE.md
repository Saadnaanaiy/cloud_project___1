# Documentation Projet Cloud Native — Soutenance

## 1. Informations GCP

| Élément | Valeur |
|---------|--------|
| **Projet ID** | `cloudappproject-494314` |
| **Projet Number** | `863212817133` |
| **Région** | `europe-west1` |
| **Zone principale** | `europe-west1-b` |
| **Zones GKE** | `europe-west1-a`, `europe-west1-b`, `europe-west1-c` |
| **Environment** | `dev` |
| **Name prefix** | `dev-cloud-native` |
| **Compte de service SA** | `cloudappproject-494314` |
| **Bucket Terraform state** | `cloudappproject-494314-tf-state` |
| **Artifact Registry** | `europe-west1-docker.pkg.dev/cloudappproject-494314/dev-employee-platform` |

## 2. Réseau VPC

| Ressource | Nom |
|-----------|-----|
| **VPC** | `dev-cloud-native-cloud-native-vpc` |
| **Subnet GKE** | `dev-cloud-native-gke-private-subnet` (CIDR: `10.10.0.0/20`) |
| **Secondary range pods** | `10.20.0.0/16` |
| **Secondary range services** | `10.30.0.0/20` |
| **Cloud Router** | `dev-cloud-native-router` |
| **Cloud NAT** | `dev-cloud-native-nat` |

## 3. Cluster GKE

| Élément | Valeur |
|---------|--------|
| **Nom cluster** | `dev-cloud-native-employee-gke` |
| **Type** | Privé (Private Cluster) |
| **Node pool** | `dev-cloud-native-node-pool` |
| **Machine type** | `e2-standard-2` (2 vCPU, 8 Go RAM) |
| **Node count** | 2 (pour la soutenance) |
| **Release channel** | REGULAR |
| **Workload Identity** | Activé |
| **Endpoint privé** | Activé |
| **Master CIDR** | `172.16.0.0/28` |
| **Network policy** | Activé |
| **Auto-repair / Auto-upgrade** | Activé |

### Recréer le cluster

```bash
cd infrastructure
terraform init -backend-config=backend.hcl
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## 4. Domaines & DNS

| Domaine | Service |
|---------|---------|
| **https://empmanager.duckdns.org** | Application principale (Frontend + API) |
| **https://empmanager.duckdns.org/docs** | Swagger API documentation |
| **https://empmanager.duckdns.org/grafana** | Grafana monitoring |

Provider DNS : **DuckDNS** (gratuit, token configuré)

## 5. CI/CD — GitHub Actions

| Workflow | Déclencheur | Action |
|----------|-------------|--------|
| **CI — Build & Push Docker Images** (`ci.yml`) | Push sur `main` | Build, push images vers Artifact Registry |
| **CD — Deploy to GKE** (`cd.yml`) | CI complété | `kubectl apply` des manifests k8s |

**Secrets GitHub nécessaires :**

| Secret | Valeur |
|--------|--------|
| `GCP_PROJECT_ID` | `cloudappproject-494314` |
| `GKE_CLUSTER` | `dev-cloud-native-employee-gke` |
| `GKE_ZONE` | `europe-west1` |
| `WIF_PROVIDER` | (output du Terraform) |
| `WIF_SERVICE_ACCOUNT` | (output du Terraform) |

**Workload Identity Federation** : GitHub Actions s'authentifie via WIF (pas de clé JSON).

## 6. Architecture Application

### Backend (NestJS + TypeORM)
- **Port** : 3001
- **Global prefix** : `/api`
- **Base de données** : MySQL 8.0
- **Auth** : JWT avec roles (admin, hr, manager)
- **Swagger** : `/docs`
- **Modules** : auth, employees, departments, attendance, announcements, messages, reports, audit, health, notifications

### Frontend (React 19 + Vite + Tailwind v4)
- **Port** : 80 (NGINX)
- **Routing** : react-router-dom v7
- **Icons** : lucide-react
- **Pages** : Login, Dashboard, Employees, Departments, Attendance, Announcements, Messages, Profile

### Déploiement K8s
| Fichier | Ressource |
|---------|-----------|
| `00-namespace.yaml` | Namespace `employee-platform` |
| `01-secrets.yaml` | Secrets backend |
| `02-configmap.yaml` | ConfigMap backend |
| `03-mysql.yaml` | StatefulSet MySQL + PVC 10Gi |
| `04-backend.yaml` | Deployment backend + HPA |
| `05-frontend.yaml` | Deployment frontend + HPA |
| `06-ingress.yaml` | NGINX Ingress |
| `07-cert-manager-issuer.yaml` | Let's Encrypt issuer |
| `08-monitoring-ingress.yaml` | Ingress Grafana |
| `09-pdb.yaml` | PodDisruptionBudget |
| `10-networkpolicy.yaml` | NetworkPolicies |
| `11-alerts.yaml` | Prometheus rules |
| `12-mysql-backup.yaml` | CronJob backup MySQL |
| `13-grafana-dashboard.yaml` | Dashboard Grafana |
| `14-resource-quota.yaml` | ResourceQuota |
| `15-argocd-app.yaml` | Application ArgoCD |

### HPA
| Ressource | Min | Max | CPU | RAM |
|-----------|-----|-----|-----|-----|
| backend-hpa | 2 | 5 | 70% | 80% |
| frontend-hpa | 2 | 5 | 70% | - |

### Images Docker
- **Backend** : `europe-west1-docker.pkg.dev/cloudappproject-494314/dev-employee-platform/backend:<tag>`
- **Frontend** : `europe-west1-docker.pkg.dev/cloudappproject-494314/dev-employee-platform/frontend:<tag>`

## 7. Monitoring (Prometheus + Grafana)

- **Stack** : `kube-prometheus-stack` (Helm)
- **Dashboards** : Cluster + Application custom
- **Alerting** : AlertManager configuré
- **Accès** : `https://empmanager.duckdns.org/grafana`
- **Login** : `admin` / `Admin123!`

## 8. Base de données MySQL

| Élément | Valeur |
|---------|--------|
| **Image** | `mysql:8.0` |
| **Stockage** | 10Gi (PVC: `mysql-data-mysql-0`) |
| **Service** | `mysql-service` (ClusterIP, port 3306) |
| **Backup** | CronJob quotidien vers bucket GCS |

## 9. ArgoCD

| Élément | Valeur |
|---------|--------|
| **URL** | `kubectl port-forward svc/argocd-server -n argocd 8080:443` → `https://localhost:8080` |
| **Login** | `admin` / (récupérer : `kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}"`) |
| **Repo** | `https://github.com/Saadnaanaiy/cloud_project___1.git` |
| **Path** | `k8s/` |
| **Target** | `main` |
| **Sync** | Automatique (self-heal, prune) |

## 10. Authentification

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Admin** | `admin@company.com` | `admin123` |
| **HR** | `hr@company.com` | `hr123` |
| **Manager** | `manager@company.com` | `manager123` |

**CAPTCHA** : Cloudflare Turnstile (désactivé en production via `DISABLE_TURNSTILE=true`)

## 11. Notifications (Brevo SMTP)

- **Service** : Brevo (300 emails/jour gratuits)
- **Envoi** : nodemailer via SMTP
- **Événements** : Notifications d'annonces, statut de congés

## 12. Procédure Jour J (Soutenances)

### Allumer le cluster

```bash
# 1. Resize le node pool
gcloud container clusters resize dev-cloud-native-employee-gke --node-pool=dev-cloud-native-node-pool --zone=europe-west1 --num-nodes=2 --project=cloudappproject-494314 --quiet

# 2. Scale les deployments
kubectl scale deployment backend -n employee-platform --replicas=2
kubectl scale deployment frontend -n employee-platform --replicas=2

# 3. Vérifier
kubectl get pods -n employee-platform -w
```

### Arrêter après la soutenance

```bash
# 1. Scale à 0
kubectl scale deployment backend -n employee-platform --replicas=0
kubectl scale deployment frontend -n employee-platform --replicas=0

# 2. Resize à 0 nodes
gcloud container clusters resize dev-cloud-native-employee-gke --node-pool=dev-cloud-native-node-pool --zone=europe-west1 --num-nums=0 --project=cloudappproject-494314 --quiet
```

### Tester la résilience (démonstration)

```bash
# Lancer Locust en parallèle
python -m locust -f tests/locustfile.py --host https://empmanager.duckdns.org --web-port 8090

# Pendant que Locust tourne, tuer un pod
kubectl delete pod -n employee-platform -l app=backend

# Vérifier qu'il n'y a pas d'erreurs dans Locust (grâce à maxUnavailable: 0)
```

## 13. Load Testing

| Outil | Commande locale | Commande production |
|-------|----------------|-------------------|
| **k6** | `k6 run --env API_URL=http://localhost:3001 tests/load-test.js` | `make load-test-k8s` |
| **Locust** | `locust -f tests/locustfile.py --host http://localhost:3001` | `python -m locust -f tests/locustfile.py --host https://empmanager.duckdns.org` |

## 14. Terraform State

Le state Terraform est stocké à distance dans un bucket GCS :
```
bucket = "cloudappproject-494314-tf-state"
prefix = "terraform/state"
```

Fichier backend : `infrastructure/backend.hcl`

## 15. Coûts GCP (cluster éteint)

| Ressource | Coût/jour |
|-----------|-----------|
| Disque PVC MySQL (10Gi) | ~$0.05 |
| Disque PVC Backup (5Gi) | ~$0.02 |
| IPs réservées | ~$0.12 |
| **Total** | **~$0.19/jour** |

Cluster allumé : ~$8-12/jour (control plane + 2 nodes × e2-standard-2)
