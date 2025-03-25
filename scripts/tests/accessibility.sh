#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

npm run build

npm run app:start -w frontend

npm run app:wait -w frontend

npm run test:accessibility

npm run app:stop -w frontend
