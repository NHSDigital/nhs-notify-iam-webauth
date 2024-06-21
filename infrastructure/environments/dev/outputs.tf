output "user_pool_id" {
  value = module.userpool.user_pool_id
}

output "identity_provider_names" {
  value = module.userpool.identity_provider_names
}

output "app_id" {
  value = module.amplify_app.app_id
}

output "zone_name" {
  value = module.route53-zone.zone_name
}
