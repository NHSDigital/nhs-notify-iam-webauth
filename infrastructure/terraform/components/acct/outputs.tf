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
