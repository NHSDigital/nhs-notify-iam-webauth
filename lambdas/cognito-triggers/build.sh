#!/bin/bash

set -euo pipefail

rm -rf dist

npx esbuild \
    --bundle \
    --minify \
    --sourcemap \
    --target=es2020 \
    --platform=node \
    --entry-names=[name] \
    --outdir=dist \
    src/pre-token-generation.ts \
    src/pre-authentication.ts \
    src/post-confirmation.ts
