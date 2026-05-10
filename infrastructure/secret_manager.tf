# ─────────────────────────────────────────────────────────────
# GCP Secret Manager — Store secrets securely
# ─────────────────────────────────────────────────────────────
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "JWT_SECRET"
  labels    = { env = var.environment }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "DB_PASSWORD"
  labels    = { env = var.environment }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "turnstile_secret_key" {
  secret_id = "TURNSTILE_SECRET_KEY"
  labels    = { env = var.environment }

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "default_admin_password" {
  secret_id = "DEFAULT_ADMIN_PASSWORD"
  labels    = { env = var.environment }

  replication {
    auto {}
  }
}

# ─────────────────────────────────────────────────────────────
# IAM — Grant External Secrets SA access to read secrets
# ─────────────────────────────────────────────────────────────
resource "google_service_account" "external_secrets" {
  account_id   = "external-secrets-sa"
  display_name = "External Secrets Operator SA"
  project      = var.project_id
}

resource "google_project_iam_member" "external_secrets_secret_accessor" {
  for_each = toset([
    google_secret_manager_secret.jwt_secret.secret_id,
    google_secret_manager_secret.db_password.secret_id,
    google_secret_manager_secret.turnstile_secret_key.secret_id,
    google_secret_manager_secret.default_admin_password.secret_id,
  ])
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.external_secrets.email}"
}

# Workload Identity binding for GKE
resource "google_service_account_iam_member" "external_secrets_wi" {
  service_account_id = google_service_account.external_secrets.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[employee-platform/external-secrets-sa]"
}
