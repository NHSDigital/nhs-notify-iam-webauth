REGION=$1
ENVIRONMENT=$2
ACTION=$3

echo Running pre.sh
echo "REGION=$REGION"
echo "ENVIRONMENT=$ENVIRONMENT"
echo "ACTION=$ACTION"

if [ "${ACTION}" == "apply" ]; then
    echo "Building lambdas for distribution"

    if [ -z "$SKIP_SANDBOX_INSTALL" ]; then npm ci; fi

    echo About to build lambdas
    npm run build-lambda
else
    echo "Skipping lambda build for action $ACTION"
fi
