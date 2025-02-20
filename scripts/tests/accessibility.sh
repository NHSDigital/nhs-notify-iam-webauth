#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

npm run build

npm run app:start

npm run app:wait

npm run test:accessibility

npm run app:stop
