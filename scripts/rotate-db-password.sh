#!/bin/bash
# ============================================================
# Rotate MySQL database password without downtime
# Usage: bash scripts/rotate-db-password.sh <new-password>
# ============================================================
set -euo pipefail

NAMESPACE="employee-platform"
MYSQL_POD="mysql-0"
NEW_PASSWORD="${1:-}"

if [ -z "$NEW_PASSWORD" ]; then
  echo "❌ Usage: $0 <new-password>"
  echo "   You can use: openssl rand -base64 32"
  exit 1
fi

# Get current root password from k8s secret
CURRENT_ROOT_PW=$(kubectl get secret mysql-secret -n "$NAMESPACE" -o jsonpath='{.data.MYSQL_ROOT_PASSWORD}' | base64 -d)
CURRENT_DB_PW=$(kubectl get secret mysql-secret -n "$NAMESPACE" -o jsonpath='{.data.DB_PASSWORD}' | base64 -d)

echo "🔄 Rotating MySQL password..."
echo "   Current DB_PASSWORD: $CURRENT_DB_PW"
echo "   New DB_PASSWORD:     $NEW_PASSWORD"

# 1. Update MySQL user password
echo "📝 Updating MySQL user 'employee_user' password..."
kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysql -u root -p"$CURRENT_ROOT_PW" \
  -e "ALTER USER 'employee_user'@'%' IDENTIFIED BY '${NEW_PASSWORD}'; FLUSH PRIVILEGES;"

# 2. Update the k8s secret with the new password
echo "🔐 Updating Kubernetes secret..."
kubectl patch secret mysql-secret -n "$NAMESPACE" -p "{\"data\":{\"DB_PASSWORD\":\"$(echo -n "$NEW_PASSWORD" | base64 -w0)\"}}"

# 3. Restart backend so it picks up the new password
echo "🔄 Restarting backend deployment..."
kubectl rollout restart deployment/backend -n "$NAMESPACE"
kubectl rollout status deployment/backend -n "$NAMESPACE" --timeout=180s

echo "✅ Password rotation complete!"
echo "   New DB_PASSWORD: $NEW_PASSWORD"
