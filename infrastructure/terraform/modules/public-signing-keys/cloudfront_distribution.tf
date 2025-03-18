
resource "aws_cloudfront_distribution" "main" {
  provider = aws.us-east-1

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Public Signing Keys (${local.csi})"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-distributionconfig.html#cfn-cloudfront-distribution-distributionconfig-priceclass
  web_acl_id          = aws_wafv2_web_acl.public_signing_keys.arn

  aliases = [local.root_domain_name]

  restrictions {
    geo_restriction {
      restriction_type = "none" # Moved to WAF
      locations        = []     # Moved to WAF
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    minimum_protocol_version = "TLSv1.2_2021" # Supports 1.2 & 1.3 - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html
    ssl_support_method       = "sni-only"
  }

  logging_config {
    bucket          = module.s3bucket_cf_logs.bucket_regional_domain_name
    include_cookies = false
  }

  origin {
    domain_name = module.s3bucket_public_signing_keys.bucket_regional_domain_name
    origin_id   = "${local.csi}-public-keys"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.signing_keys.cloudfront_access_identity_path
    }
  }

  # Github Web-CMS behaviour
  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
    ]
    cached_methods = [
      "GET",
      "HEAD",
    ]
    target_origin_id = "${local.csi}-public-keys"

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }
}

resource "aws_cloudfront_origin_access_identity" "signing_keys" {
  comment = "Used to access the S3 content for the public signing keys bucket"
}
