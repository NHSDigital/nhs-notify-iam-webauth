#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

npm run build

npm run app:start -w frontend

npm run app:wait -w frontend

TEST_EXIT_CODE=0
npm run test:accessibility || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"
mkdir -p ../acceptance-test-report
cp -r tests/accessibility/.reports/accessibility tests/acceptance-test-report

npm run app:stop -w frontend

exit $TEST_EXIT_CODE
