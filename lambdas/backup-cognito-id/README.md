# Cognito User Backup Lambda

This AWS Lambda function backs up or deletes Cognito user data to/from an S3 bucket in response to Cognito CloudTrail events. It is intended to provide an audit trail or backup for user accounts managed in AWS Cognito.

## Features

- **Backup:** On user creation or update, fetches user attributes from Cognito and stores them as a CSV file in S3.
- **Delete:** On user deletion, removes the corresponding CSV backup from S3.
- **Logging:** Structured logging for audit and debugging.

## Environment Variables

- `AUDIT_EVENTS` (optional): If set, logs incoming events for auditing.
- `COGNITO_POOL_ID`: The ID of the Cognito User Pool.
- `S3_BUCKET_NAME`: The name of the S3 bucket for storing user backups.

## Event Handling

- **Backup:** Triggered for all events except `DeleteUser` and `AdminDeleteUser`.
- **Delete:** Triggered for `DeleteUser` and `AdminDeleteUser` events.

## CSV Format

- The CSV file contains all user attributes as headers and values, with proper escaping for quotes.

## Example Usage

This Lambda is typically triggered by Cognito events via EventBridge or a similar mechanism.

## Local Development

Install dependencies:

```bash
npm install
```

## Testing

Run Jest tests:

```bash
npm run test
```

## Deployment

Deploy using your preferred IaC tool (e.g., AWS SAM, Serverless Framework, Terraform) and ensure the Lambda has permissions to:

- Read from Cognito
- Read/write to the specified S3 bucket
