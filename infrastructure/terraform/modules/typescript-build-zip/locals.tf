locals {
  entrypoint_stem_map = { for entrypoint in var.entrypoints : entrypoint => trimsuffix(basename(entrypoint), ".ts") }
}
