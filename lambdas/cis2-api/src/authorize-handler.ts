/* eslint-disable import-x/prefer-default-export */
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { extractStringRecord } from '@/src/utils/extract-string-record';

export const handler: APIGatewayProxyHandler = async (event) => {
  const originalUrl = `${process.env.CIS2_URL}/authorize`;

  const originalQueryParameters: Record<string, string> = extractStringRecord(
    event.queryStringParameters ?? {}
  );

  const queryParameters = new URLSearchParams(originalQueryParameters);

  queryParameters.append('prompt', 'login');
  queryParameters.append('acr_values', 'AAL2_OR_AAL3_ANY');

  const updatedUrl = `${originalUrl}?${queryParameters.toString()}`;

  return {
    statusCode: 302,
    headers: { ...extractStringRecord(event.headers), Location: updatedUrl },
    body: JSON.stringify({
      message: `Redirecting to ${updatedUrl}`,
    }),
  };
};
