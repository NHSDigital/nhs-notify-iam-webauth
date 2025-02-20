output "zips" {
  value = {
    for k, v in data.archive_file.zip : k => {
      path         = v.output_path,
      base64sha256 = v.output_base64sha256
    }
  }
}
