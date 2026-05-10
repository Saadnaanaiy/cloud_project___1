output "vpc_name" {
  value       = google_compute_network.main.name
  description = "Created VPC name"
}

output "subnet_name" {
  value       = google_compute_subnetwork.gke.name
  description = "Created GKE subnet name"
}

output "artifact_registry_repo" {
  value       = google_artifact_registry_repository.docker_repo.id
  description = "Artifact Registry repository ID"
}

output "gke_cluster_name" {
  value       = google_container_cluster.main.name
  description = "GKE cluster name"
}

output "gke_cluster_endpoint" {
  value       = google_container_cluster.main.endpoint
  description = "GKE cluster endpoint"
}

output "backup_bucket" {
  value       = google_storage_bucket.backups.name
  description = "Backup GCS bucket name"
}

output "frontend_cdn_bucket" {
  value       = google_storage_bucket.frontend_cdn.name
  description = "Frontend CDN GCS bucket name"
}

output "external_secrets_sa" {
  value       = google_service_account.external_secrets.email
  description = "External Secrets Operator service account email"
}
