data "local_file" "code" {
  for_each = local.entrypoint_stem_map

  depends_on = [null_resource.typescript_build]

  filename = "${var.source_code_dir}/${var.output_dir}/${each.value}.js"
}

data "local_file" "sourcemap" {
  for_each = local.entrypoint_stem_map

  depends_on = [null_resource.typescript_build]

  filename = "${var.source_code_dir}/${var.output_dir}/${each.value}.js.map"
}

data "archive_file" "zip" {
  for_each = local.entrypoint_stem_map

  depends_on  = [null_resource.typescript_build]
  type        = "zip"
  output_path = "${var.source_code_dir}/${var.output_dir}/${each.value}.zip"

  source {
    filename = "${each.value}.js"
    content  = data.local_file.code[each.key].content
  }

  source {
    filename = "${each.value}.js.map"
    content  = data.local_file.sourcemap[each.key].content
  }
}
