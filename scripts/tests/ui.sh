#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

npx playwright install --with-deps > /dev/null

TEST_EXIT_CODE=0
npm run test:ui || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

mkdir -p ./tests/acceptance-test-report
cp -r ./tests/test-team/playwright-report-component-tests ./tests/acceptance-test-report
[[ -e ./tests/test-team/test-results ]] && cp -r ./tests/test-team/test-results ./tests/acceptance-test-report

exit $TEST_EXIT_CODE
