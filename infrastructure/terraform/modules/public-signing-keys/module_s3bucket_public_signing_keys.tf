module "s3bucket_public_signing_keys" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip"

  name = "public-keys"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  acl           = "public-read"
  versioning    = true
  force_destroy = !var.protect_public_key_bucket

  bucket_logging_target = {
    bucket = var.s3_access_logs_bucket_id
  }

  lifecycle_rules = [
    {
      enabled = true

      noncurrent_version_transition = [
        {
          noncurrent_days = "30"
          storage_class   = "STANDARD_IA"
        }
      ]

      noncurrent_version_expiration = {
        noncurrent_days = "90"
      }

      abort_incomplete_multipart_upload = {
        days = "1"
      }
    }
  ]

  policy_documents = [
    data.aws_iam_policy_document.bucket_policy_public_signing_keys.json
  ]

  public_access = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }


  default_tags = {
    Name = "Public signing keys for federated auth suppliers"
  }
}

resource "aws_s3_bucket_cors_configuration" "public_public_keys" {
  bucket = module.s3bucket_public_signing_keys.bucket

  cors_rule {
    allowed_headers = ["Authorization"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 300
  }
}
