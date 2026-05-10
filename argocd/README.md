# ArgoCD — GitOps Deployment

## Install ArgoCD

```bash
kubectl create namespace argocd
helm repo add argo https://argoproj.github.io/argo-helm
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd --create-namespace \
  --set server.service.type=LoadBalancer \
  --wait
```

## Get admin password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

## Apply Application manifests

```bash
kubectl apply -f argocd/application.yaml
```

ArgoCD will then auto-sync with the Git repo and deploy any changes to the cluster.
