import type { PreAuthenticationTriggerEvent, Context, Callback } from 'aws-lambda';
import { mockDeep } from 'jest-mock-extended';
import { handler } from '../handler';

const OLD_ENV = {...process.env};

beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2022-01-01 09:00:00'));
});

beforeEach(() => {
    process.env.EXPECTED_ID_ASSURANCE_LEVEL = '3';
    process.env.EXPECTED_AUTHENTICATION_ASSURANCE_LEVEL = '3';
    process.env.MAXIMUM_EXPECTED_AUTH_TIME_DIVERGENCE_SECONDS = '60';
});

afterAll(() => {
    process.env = OLD_ENV;
});

test('fails with lambda misconfiguration', async () => {
    process.env.EXPECTED_ID_ASSURANCE_LEVEL = '';

    const event = mockDeep<PreAuthenticationTriggerEvent>({
        userName: 'CIS2-test',
        request: {
            userAttributes: {
                id_assurance_level: '3',
                auth_assurance_level: '3',
                auth_time: '1641027675',
            }
        }
    });

    await expect(() => handler(event, mockDeep<Context>(), mockDeep<Callback>())).rejects.toThrow('Lambda misconfiguration');
});

test('passes with non-CIS2 user', async () => {
    const event = mockDeep<PreAuthenticationTriggerEvent>({
        userName: 'test-user',
        request: {
            userAttributes: {
                id_assurance_level: '1',
                auth_assurance_level: '1',
                auth_time: '1641027675',
            }
        }
    });

    expect(await handler(event, mockDeep<Context>(), mockDeep<Callback>())).toEqual(event);
});

test('fails with invalid id_assurance_level', async () => {
    const event = mockDeep<PreAuthenticationTriggerEvent>({
        userName: 'CIS2-test',
        request: {
            userAttributes: {
                id_assurance_level: '2',
                auth_assurance_level: '3',
                auth_time: '1641027615',
            }
        }
    });

    await expect(() => handler(event, mockDeep<Context>(), mockDeep<Callback>())).rejects.toThrow('Invalid id_assurance_level. Expected 3');
});

test('fails with invalid authentication_assurance_level', async () => {
    const event = mockDeep<PreAuthenticationTriggerEvent>({
        userName: 'CIS2-test',
        request: {
            userAttributes: {
                id_assurance_level: '3',
                auth_assurance_level: '1',
                auth_time: '1641027615',
            }
        }
    });

    await expect(() => handler(event, mockDeep<Context>(), mockDeep<Callback>())).rejects.toThrow('Invalid authentication_assurance_level. Expected 3');
});

test('fails with invalid auth_time', async () => {
    const event = mockDeep<PreAuthenticationTriggerEvent>({
        userName: 'CIS2-test',
        request: {
            userAttributes: {
                id_assurance_level: '3',
                auth_assurance_level: '3',
                auth_time: '1641027675',
            }
        }
    });

    await expect(() => handler(event, mockDeep<Context>(), mockDeep<Callback>())).rejects.toThrow('auth_time claim does not match current time');
});

test('passes with valid user attributes', async () => {
    const event = mockDeep<PreAuthenticationTriggerEvent>({
        userName: 'CIS2-test',
        request: {
            userAttributes: {
                id_assurance_level: '3',
                authentication_assurance_level: '3',
                auth_time: '1641027615',
            }
        }
    });

    expect(await handler(event, mockDeep<Context>(), mockDeep<Callback>())).toEqual(event);
});
