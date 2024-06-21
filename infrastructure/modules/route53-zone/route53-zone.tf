# Should reference existing zone if created via standard account boostrap
# data "aws_route53_zone" "zone" {
#   name = "iam.${var.stage}.nhsnotify.national.nhs.uk"
# }

resource "aws_route53_zone" "zone" {
  name = "iam.${var.stage}.nhsnotify.national.nhs.uk"
}
