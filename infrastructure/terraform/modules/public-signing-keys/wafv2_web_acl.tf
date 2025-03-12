resource "aws_wafv2_web_acl" "public_signing_keys" {
  provider = aws.us-east-1

  name        = local.csi
  description = "${var.environment} WAF"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  dynamic "rule" {
    for_each = var.enable_github_actions_ip_access ? [1] : []

    content {
      name     = "GithubActionsIPRestriction"
      priority = 10

      action {
        allow {}
      }

      statement {
        or_statement {
          statement {
            ip_set_reference_statement {
              arn = aws_wafv2_ip_set.github_actions_ipv4[0].arn
            }
          }

          statement {
            ip_set_reference_statement {
              arn = aws_wafv2_ip_set.github_actions_ipv6[0].arn
            }
          }
        }
      }

      visibility_config {
        metric_name                = "${local.csi}_gha_ip_restrictions_metric"
        cloudwatch_metrics_enabled = true
        sampled_requests_enabled   = true
      }
    }
  }

  rule {
    name     = "GeoLocationTrafficWhitelist"
    priority = 20

    action {
      block {}
    }

    statement {
      not_statement {
        statement {
          geo_match_statement {
            country_codes = ["GB"]
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      sampled_requests_enabled   = true
      metric_name                = "${local.csi}_geo_location_whitelist"
    }
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 30
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"

        rule_action_override {
          name = "GenericRFI_QUERYARGUMENTS"
          action_to_use {
            count {}
          }
        }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.csi}_waf_aws_managed_common"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 40
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.csi}_waf_aws_managed_input"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 50
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.csi}_waf_aws_managed_sql"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesAmazonIpReputationList"
    priority = 60
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.csi}_waf_aws_managed_reputation"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "RateLimit"
    priority = 100
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = var.waf_rate_limit_cdn
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.csi}_waf_rate_limit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.csi}_waf"
    sampled_requests_enabled   = true
  }
}
