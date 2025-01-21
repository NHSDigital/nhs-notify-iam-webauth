# NHS Notify IAM Web Auth repository

NextJS application deployed via AWS Amplify to act as a login portal for NHS users.

Read more about the technical design at [REFCOM-2024-007: WebUI User Auth](https://nhsd-confluence.digital.nhs.uk/display/RIS/REFCOM-2024-007%3A+WebUI+User+Auth).

## Setting up locally

### Git

- Make sure you have GitHub access with the right permissions
- Setup git locally on your machine
- Set your local git email as you `*@nhs.net` email `e.g. git config --global user.email "firstname.lastname1@nhs.net"`
- Setup commit signing (this is required before you can commit any code to the repository). This is a very good resource to help Mac users `https://gist.github.com/troyfontaine/18c9146295168ee9ca2b30c00bd1b41e`
- Pull the repository here `git@github.com:NHSDigital/nhs-notify-web-template-management.git`

### Development and Tools

- Install `asdf` [HERE](https://asdf-vm.com/guide/getting-started.html#_2-download-asdf). We use this tool to manage the required version for packages (this can be found in the `.tool-versions` file at the root of the project) on the project. You can use other tools usch as `brew`, `apt`, etc, but you will be risking having different package versions to other developers.
- Then you need to install the following plugins:

  ```shell
    asdf plugin-add nodejs
    asdf plugin-add direnv
    asdf plugin-add terraform
    asdf plugin-add gitleaks
    asdf plugin-add pre-commit
  ```

- Now you can install the tools, and they will be runnable from within the `nhs-notify-web-template-management` directory:

  ```shell
    asdf install
  ```

- Now you can run the command below to install the packages in the project:

  ```shell
    npm install
  ```

### Creating a backend sandbox

To create a backend sandbox intended for use with local development, run the command

```shell
  npm run create-backend-sandbox environment-name
```

substituting your environment name in as appropriate.

This command will also generate an amplify_outputs file in the root of the repository that will be used when running the app locally.

To destroy the sandbox when it is no longer needed, run the command

```shell
  npm run destroy-backend-sandbox environment-name
```

### Connecting to an existing Cognito instance

You can point the app at any existing Cognito instance, not necessarily one you have created, by updating the user_pool_id and user_pool_client_id values in the amplify_outputs file.

### Setup a user in Cognito

In order to use a new Cognito user pool, you can run the sandbox auth script with your chosen email and password:

```bash
./scripts/sandbox_auth.sh email password
```

You can also manually create a user in that user pool:

1. Log into the `nhs-notify-iam-dev` AWS account
2. Load AWS Cognito
3. Open the relevant Cognito user pool
4. Select `Create user`
5. Enter details
   1. Use your .nhs email address
   2. Select randomly generated password
   3. Select Send an email invitation
6. Wait for email to arrive in your .nhs inbox
7. Load web application and sign in

## Running project locally

Having created your backend sandbox or otherwise set up your amplify_outputs file, you can start the app locally by running

```bash
npm run dev
```

### Running WebAuth and Templates projects locally

[Read more](https://github.com/NHSDigital/nhs-notify-web-template-management/blob/main/README.md#running-templates-and-webauth-projects-locally)

## Testing

### Unit tests

```**bash**
npm run test:unit
```

### Playwright automated tests

You'll need to ensure you have an authenticated terminal to `nhs-notify-iam-dev` AWS account. Then run:

```bash
cd tests/test-team
npm run test:local-ui
```
