echo Running pre.sh

if [ -z "$SKIP_SANDBOX_INSTALL" ]; then npm ci; fi

echo About to build lambdas
(cd ../../../.. && npm run build-lambda)
