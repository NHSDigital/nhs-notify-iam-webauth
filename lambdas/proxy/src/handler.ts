import type { APIGatewayProxyHandler } from 'aws-lambda';

export const extractStringRecord = (
  object: Record<string, string | undefined>
): Record<string, string> => {
  const entries = Object.entries(object);

  const stringEntries: [string, string][] = entries.flatMap(([key, value]) => {
    if (!value) {
      return [];
    }

    return [[key, value]];
  });

  return Object.fromEntries(stringEntries);
};

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
