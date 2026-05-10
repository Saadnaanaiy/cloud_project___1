# ─────────────────────────────────────────────────────────────
# Cloud Storage — Backups bucket
# ─────────────────────────────────────────────────────────────
resource "google_storage_bucket" "backups" {
  name          = "${var.project_id}-backups"
  location      = var.region
  storage_class = "NEARLINE"
  force_destroy = var.environment != "prod"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    env = var.environment
  }
}

# ─────────────────────────────────────────────────────────────
# Cloud Storage — Frontend CDN bucket
# Serve static frontend assets via Cloud CDN
# ─────────────────────────────────────────────────────────────
resource "google_storage_bucket" "frontend_cdn" {
  name          = "${var.project_id}-frontend-cdn"
  location      = var.region
  storage_class = "STANDARD"
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  cors {
    origin          = ["https://empmanager.duckdns.org"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }

  labels = {
    env = var.environment
  }
}

# Cloud CDN backend bucket
resource "google_compute_backend_bucket" "frontend_cdn" {
  name        = "${local.name_prefix}-frontend-cdn"
  description = "Cloud CDN backend for frontend static assets"
  bucket_name = google_storage_bucket.frontend_cdn.name
  enable_cdn  = true

  cdn_policy {
    signed_url_cache_max_age_sec = 7200
  }
}

# ─────────────────────────────────────────────────────────────
# Cloud CDN — Output URL map for frontend assets
# ─────────────────────────────────────────────────────────────
resource "google_compute_url_map" "frontend_cdn" {
  name            = "${local.name_prefix}-frontend-cdn"
  default_service = google_compute_backend_bucket.frontend_cdn.self_link
}
