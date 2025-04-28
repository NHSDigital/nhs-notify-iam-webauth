echo Running pre.sh
pwd

npm ci

echo About to build lambdas
(cd ../../../.. && pwd && ls && npm run build-lambda)
