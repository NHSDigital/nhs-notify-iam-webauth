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

### Setup .env

copy and rename `.env.template` to `.env`

#### USER_POOL_ID (optional)

1. Log into the `nhs-notify-iam-dev` AWS account
2. Load AWS Cognito
3. Open `nhs-notify-main-app` Cognito user pool
4. Grab `User pool ID` value

#### USER_POOL_CLIENT_ID (optional)

1. Log into the `nhs-notify-iam-dev` AWS account
2. Load AWS Cognito
3. Open `nhs-notify-main-app` Cognito user pool
4. Load `App integration` tab
   1. Found (at the bottom of the page)
5. Grab `Client ID` value

#### USE_LOCAL_AUTH

```
true/false
```

When `true` a new Cognito instance will be created within the Amplify sandbox. You'll need to manually add users.

### Setup a user in Cognito

1. Log into the `nhs-notify-iam-dev` AWS account
2. Load AWS Cognito
3. Open `nhs-notify-main-app` Cognito user pool
4. Select `Create user`
5. Enter details
   1. Use your .nhs email address
   2. Select randomly generated password
   3. Select Send an email invitation
6. Wait for email to arrive in your .nhs inbox
7. Load web application and sign in

## Running project locally

1. To run an Amplify sandbox. To do this, authenticate with the AWS account `nhs-notify-iam-dev` then run:

   ```bash
   npx ampx sandbox --profile <your AWS profile for nhs-notify-iam-dev account>
   ```

2. Then in a separate terminal, run the app locally:

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

### Playwright sutomated tests

```bash
cd /tests/test-team/
npm run test:e2e-local
```
