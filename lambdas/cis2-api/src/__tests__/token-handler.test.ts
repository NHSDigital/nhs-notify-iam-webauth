import type { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda';
import { mockDeep } from 'jest-mock-extended';
import { sign } from 'jsonwebtoken';
import axios from 'axios';
import { type Cis2IdToken, handler, validateStatus } from '@/src/token-handler';

const OLD_ENV = { ...process.env };

jest.mock('axios');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00:00'));
  jest.resetAllMocks();
});

beforeEach(() => {
  process.env.CIS2_URL = 'cis2-url';
  process.env.EXPECTED_ID_ASSURANCE_LEVEL = '3';
  process.env.EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL = '2';
  process.env.MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS = '60';
});

afterAll(() => {
  process.env = OLD_ENV;
});

const setup = async (jwtPayload: Cis2IdToken) => {
  const jwt = sign(jwtPayload, 'test');

  const axiosResponse = {
    id_token: jwt,
  };

  const event = mockDeep<APIGatewayProxyEvent>({
    body: 'event-body',
  });

  const axiosPostMock = jest.mocked(axios).post.mockResolvedValue({
    data: axiosResponse,
    headers: {
      key: 'value',
    },
    status: 200,
  });

  const response = await handler(
    event,
    mockDeep<Context>(),
    mockDeep<Callback>()
  );

  return { response, axiosPostMock, axiosResponse };
};

test('fails with lambda misconfiguration', async () => {
  process.env.EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL = '';

  const event = mockDeep<APIGatewayProxyEvent>({
    body: 'event-body',
  });

  await expect(() =>
    handler(event, mockDeep<Context>(), mockDeep<Callback>())
  ).rejects.toThrow('Lambda misconfiguration');
});

test('fails with lambda misconfiguration 2', async () => {
  process.env.EXPECTED_ID_ASSURANCE_LEVEL = '';

  const event = mockDeep<APIGatewayProxyEvent>({
    body: 'event-body',
  });

  await expect(() =>
    handler(event, mockDeep<Context>(), mockDeep<Callback>())
  ).rejects.toThrow('Lambda misconfiguration');
});

test('400 with missing event body', async () => {
  const event = mockDeep<APIGatewayProxyEvent>({
    body: undefined,
  });

  const response = await handler(
    event,
    mockDeep<Context>(),
    mockDeep<Callback>()
  );

  expect(response).toEqual({
    statusCode: 400,
    body: 'Missing event body',
  });
});

test('returns without running checks if CIS2 returns non-200 response', async () => {
  const axiosResponse = 'Bad request';

  const event = mockDeep<APIGatewayProxyEvent>({
    body: 'event-body',
  });

  const axiosPostMock = jest.mocked(axios).post.mockResolvedValue({
    data: axiosResponse,
    headers: {
      key: 'value',
    },
    status: 400,
  });

  const response = await handler(
    event,
    mockDeep<Context>(),
    mockDeep<Callback>()
  );

  expect(axiosPostMock).toHaveBeenCalledWith(
    'cis2-url/access_token',
    'event-body',
    expect.anything()
  );

  expect(response).toEqual({
    statusCode: 400,
    headers: {
      key: 'value',
    },
    body: JSON.stringify(axiosResponse),
  });
});

test('403 with invalid id_assurance_level', async () => {
  const { axiosPostMock, response } = await setup({
    id_assurance_level: 0,
    authentication_assurance_level: 2,
    auth_time: new Date('2022-01-01 00:00').getTime() / 1000,
  });

  expect(axiosPostMock).toHaveBeenCalledWith(
    'cis2-url/access_token',
    'event-body',
    expect.anything()
  );
  expect(response).toEqual({
    statusCode: 403,
    body: 'ID token failed validation',
  });
});

test('403 with invalid authentication_assurance_level', async () => {
  const { axiosPostMock, response } = await setup({
    id_assurance_level: 3,
    authentication_assurance_level: 0,
    auth_time: new Date('2022-01-01 09:00').getTime() / 1000,
  });

  expect(axiosPostMock).toHaveBeenCalledWith(
    'cis2-url/access_token',
    'event-body',
    expect.anything()
  );
  expect(response).toEqual({
    statusCode: 403,
    body: 'ID token failed validation',
  });
});

test('403 with invalid auth_time', async () => {
  const { axiosPostMock, response } = await setup({
    id_assurance_level: 3,
    authentication_assurance_level: 2,
    auth_time: new Date('2022-01-01 08:00').getTime() / 1000,
  });

  expect(axiosPostMock).toHaveBeenCalledWith(
    'cis2-url/access_token',
    'event-body',
    expect.anything()
  );
  expect(response).toEqual({
    statusCode: 403,
    body: 'ID token failed validation',
  });
});

test('passes with valid user attributes', async () => {
  const { axiosPostMock, axiosResponse, response } = await setup({
    id_assurance_level: 3,
    authentication_assurance_level: 2,
    auth_time: new Date('2022-01-01 09:00').getTime() / 1000,
  });

  expect(axiosPostMock).toHaveBeenCalledWith(
    'cis2-url/access_token',
    'event-body',
    expect.anything()
  );
  expect(response).toEqual({
    statusCode: 200,
    headers: {
      key: 'value',
    },
    body: JSON.stringify(axiosResponse),
  });
});

test('validateStatus', () => {
  expect(validateStatus()).toEqual(true);
});
