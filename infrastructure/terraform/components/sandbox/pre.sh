echo Running pre.sh
pwd

if [ "$SUPPRESS_SANDBOX_CI" != "true" ]
    then
        npm ci
fi

echo About to build lambdas
(cd ../../../.. && pwd && ls && npm run build-lambda)
