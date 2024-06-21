locals {
  app_domain_name = "app.${module.route53-zone.zone_name}"
}
