#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

npm run build
npm run start --prefix frontend &
APP_PID=$!

npm run app:wait -w frontend

TEST_EXIT_CODE=0
npm run test:accessibility || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

kill $APP_PID 2>/dev/null || true
wait $APP_PID 2>/dev/null || true

mkdir -p ./tests/acceptance-test-report
cp -r ./.reports/accessibility tests/acceptance-test-report

npm run app:stop -w frontend

exit $TEST_EXIT_CODE
