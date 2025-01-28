import type { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import { mockDeep } from 'jest-mock-extended';
import { handler } from '../authorize-handler';

const OLD_ENV = { ...process.env };

beforeEach(() => {
  process.env.CIS2_URL = 'cis2-url';
});

afterAll(() => {
  process.env = OLD_ENV;
});

test('adds query parameters and returns 302', async () => {
  const event = mockDeep<APIGatewayProxyEvent>({
    queryStringParameters: {
      query: 'query-value',
    },
    headers: {
      header: 'header-value',
    },
  });

  const response = await handler(
    event,
    mockDeep<Context>(),
    mockDeep<Callback>()
  );

  expect(response).toEqual({
    statusCode: 302,
    headers: {
      header: 'header-value',
      Location:
        'cis2-url/authorize?query=query-value&prompt=login&acr_values=AAL2_OR_AAL3_ANY',
    },
    body: JSON.stringify({
      message:
        'Redirecting to cis2-url/authorize?query=query-value&prompt=login&acr_values=AAL2_OR_AAL3_ANY',
    }),
  });
});

test('adds query parameters and returns 302 when request has no query parameters', async () => {
  const event = mockDeep<APIGatewayProxyEvent>({
    queryStringParameters: undefined,
    headers: {
      header: 'header-value',
    },
  });

  const response = await handler(
    event,
    mockDeep<Context>(),
    mockDeep<Callback>()
  );

  expect(response).toEqual({
    statusCode: 302,
    headers: {
      header: 'header-value',
      Location: 'cis2-url/authorize?prompt=login&acr_values=AAL2_OR_AAL3_ANY',
    },
    body: JSON.stringify({
      message:
        'Redirecting to cis2-url/authorize?prompt=login&acr_values=AAL2_OR_AAL3_ANY',
    }),
  });
});
