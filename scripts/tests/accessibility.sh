#!/bin/bash

set -euo pipefail

npm run build

npm run app:start

npm run app:wait

npm run test:accessibility
