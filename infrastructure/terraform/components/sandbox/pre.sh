echo Running pre.sh

if [ "$SUPPRESS_SANDBOX_CI" != "true" ]
    then
        npm ci
fi

echo About to build lambdas
(cd ../../../.. && npm run build-lambda)
