echo Running pre.sh

npm ci

echo About to build lambdas
npm run build-lambda
