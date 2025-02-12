resource "random_bytes" "csrf_secret" {
  length = 16
}
