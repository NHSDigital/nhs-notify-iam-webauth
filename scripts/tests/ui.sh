#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

npx playwright install --with-deps > /dev/null

TEST_EXIT_CODE=0
npm run test:ui || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

mkdir -p ../acceptance-test-report
cp -r ./playwright-report-component-tests ../acceptance-test-report
[[ -e test-results ]] && cp -r ./test-results ../acceptance-test-report

exit $TEST_EXIT_CODE
