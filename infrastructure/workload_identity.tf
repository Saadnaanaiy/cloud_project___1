resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "${local.name_prefix}-github-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Identity pool for GitHub Actions CI/CD"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "${local.name_prefix}-github-provider"
  display_name                       = "GitHub Actions Provider"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  # Only allow tokens from YOUR repository
  # IMPORTANT: Replace with your actual GitHub username and repo
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository == 'Saadn/cloud_project'"
}

# Service Account for GitHub Actions
resource "google_service_account" "github_actions" {
  account_id   = "${local.name_prefix}-github-sa"
  display_name = "GitHub Actions CI/CD Service Account"
  description  = "Used by GitHub Actions to push images and deploy to GKE"
}

# Allow GitHub Actions to impersonate this service account
resource "google_service_account_iam_member" "github_wif" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/Saadn/cloud_project"
}

# Grant permissions to the GitHub Actions SA
resource "google_project_iam_member" "github_sa_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_sa_gke_developer" {
  project = var.project_id
  role    = "roles/container.clusterViewer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_sa_storage_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Output the values needed for GitHub Secrets
output "wif_provider" {
  value       = "projects/${var.project_id}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github.workload_identity_pool_id}/providers/${google_iam_workload_identity_pool_provider.github.workload_identity_pool_provider_id}"
  description = "WIF_PROVIDER value for GitHub Actions secret"
}

output "wif_service_account" {
  value       = google_service_account.github_actions.email
  description = "WIF_SERVICE_ACCOUNT value for GitHub Actions secret"
}
