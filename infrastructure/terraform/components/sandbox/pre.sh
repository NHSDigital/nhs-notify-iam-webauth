if [ "$SUPPRESS_SANDBOX_CI" != "true" ]
    then
        npm ci
fi

(cd ../../../.. && npm run build-lambda)
