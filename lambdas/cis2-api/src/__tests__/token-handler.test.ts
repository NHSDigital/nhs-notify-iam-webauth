import type { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import { mockDeep } from 'jest-mock-extended';
import { sign } from 'jsonwebtoken';
import axios from 'axios';
import { handler, validateStatus, type Cis2IdToken } from '@/src/token-handler';
import { getKmsSigningKeyId } from '@/src/utils/key-directory-repository';
import { generateJwt } from '@/src/utils/jwt-generator';

const OLD_ENV = { ...process.env };

jest.mock('axios');
jest.mock('@/src/utils/key-directory-repository');
jest.mock('@/src/utils/jwt-generator');

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
  process.env.CIS2_AUTH_MODE = 'client_secret';
});

afterAll(() => {
  process.env = OLD_ENV;
});

const mockEvent = new URLSearchParams({
  grant_type: 'test_grant',
  client_id: 'test',
  client_secret: 'mocksecret',
  redirect_uri: 'https://test.nhs.uk/oauth2/idpresponse',
});

const mockEventBlankSecret = new URLSearchParams({
  grant_type: 'test_grant',
  client_id: 'test-client',
  client_secret: '',
  redirect_uri: 'https://test.nhs.uk/oauth2/idpresponse',
});

const mockEventBody = mockEvent.toString();
const mockEventBodyWithoutSecret = mockEventBlankSecret.toString();

const setup = async (jwtPayload: Cis2IdToken, eventBody = mockEventBody) => {
  const jwt = sign(jwtPayload, 'test');

  const axiosResponse = {
    id_token: jwt,
  };

  const event = mockDeep<APIGatewayProxyEvent>({
    body: eventBody,
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
    body: mockEventBody,
  });

  await expect(() =>
    handler(event, mockDeep<Context>(), mockDeep<Callback>())
  ).rejects.toThrow('Lambda misconfiguration');
});

test('fails with lambda misconfiguration 2', async () => {
  process.env.EXPECTED_ID_ASSURANCE_LEVEL = '';

  const event = mockDeep<APIGatewayProxyEvent>({
    body: mockEventBody,
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
    body: mockEventBody,
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
    mockEventBody,
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
    mockEventBody,
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
    mockEventBody,
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
    mockEventBody,
    expect.anything()
  );
  expect(response).toEqual({
    statusCode: 403,
    body: 'ID token failed validation',
  });
});

test('passes verification checks with valid user attributes using client secret', async () => {
  const { axiosResponse, axiosPostMock, response } = await setup({
    id_assurance_level: 3,
    authentication_assurance_level: 2,
    auth_time: new Date('2022-01-01 09:00').getTime() / 1000,
  });

  expect(axiosPostMock).toHaveBeenCalledWith(
    'cis2-url/access_token',
    mockEventBody,
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

test('passes verification checks with valid user attributes using jwks', async () => {
  // arrange
  process.env.CIS2_AUTH_MODE = 'jwks';
  jest
    .mocked(getKmsSigningKeyId)
    .mockImplementation(() => Promise.resolve('test-key-id'));
  const mockedGenerateJwt = jest
    .mocked(generateJwt)
    .mockImplementation(() => Promise.resolve('mock.jwt.test'));
  const expectedCis2RequestBody = new URLSearchParams({
    grant_type: 'test_grant',
    client_id: 'test-client',
    redirect_uri: 'https://test.nhs.uk/oauth2/idpresponse',
    client_assertion_type:
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: 'mock.jwt.test',
  });

  // act
  const { axiosResponse, axiosPostMock, response } = await setup(
    {
      id_assurance_level: 3,
      authentication_assurance_level: 2,
      auth_time: new Date('2022-01-01 09:00').getTime() / 1000,
    },
    mockEventBodyWithoutSecret
  );

  // assert
  expect(axiosPostMock).toHaveBeenCalledWith(
    'cis2-url/access_token',
    expectedCis2RequestBody.toString(),
    expect.anything()
  );
  expect(response).toEqual({
    statusCode: 200,
    headers: {
      key: 'value',
    },
    body: JSON.stringify(axiosResponse),
  });
  expect(mockedGenerateJwt).toHaveBeenCalledWith('test-key-id', 'test-client');
});

test('should reject missing client id when using jwks', async () => {
  // arrange
  process.env.CIS2_AUTH_MODE = 'jwks';
  jest
    .mocked(getKmsSigningKeyId)
    .mockImplementation(() => Promise.resolve('test-key-id'));
  jest
    .mocked(generateJwt)
    .mockImplementation(() => Promise.resolve('mock.jwt.test'));

  // act
  let caughtError;
  try {
    await setup(
      {
        id_assurance_level: 3,
        authentication_assurance_level: 2,
        auth_time: new Date('2022-01-01 09:00').getTime() / 1000,
      },
      'grant_type=test_grant'
    );
  } catch (error) {
    caughtError = error;
  }

  // assert
  expect(caughtError).toBeTruthy();
  expect((caughtError as Error).message).toBe('Missing client_id');
});

test('validateStatus', () => {
  expect(validateStatus()).toEqual(true);
});
