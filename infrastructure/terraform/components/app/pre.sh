echo Running pre.sh

npm ci

echo About to build lambdas
(cd ../../../.. && npm run build-lambda)
