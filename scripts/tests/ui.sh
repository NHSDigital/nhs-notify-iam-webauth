#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

npx playwright install --with-deps

cd tests/test-team

npm run test:local-ui
