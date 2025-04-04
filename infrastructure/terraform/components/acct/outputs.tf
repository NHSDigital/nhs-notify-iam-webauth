output "dns_zone" {
  value = {
    id          = aws_route53_zone.main.id
    name        = aws_route53_zone.main.name
    nameservers = aws_route53_zone.main.name_servers
  }
}

output "github_pat_ssm_param_name" {
  value = aws_ssm_parameter.github_pat.name
}

output "s3_buckets" {
  value = {
    access_logs = {
      arn    = module.s3bucket_access_logs.arn
      bucket = module.s3bucket_access_logs.bucket
      id     = module.s3bucket_access_logs.id
    }
    backup_reports = {
      arn    = module.s3bucket_backup_reports.arn
      bucket = module.s3bucket_backup_reports.bucket
      id     = module.s3bucket_backup_reports.id
    }
    lambda_function_artefacts = {
      arn    = module.s3bucket_lambda_artefacts.arn
      bucket = module.s3bucket_lambda_artefacts.bucket
      id     = module.s3bucket_lambda_artefacts.id
    }
  }
}

output "kms_sandbox_arn" {
  value = var.support_sandbox_environments ? module.kms_sandbox[0].arn : null
}
