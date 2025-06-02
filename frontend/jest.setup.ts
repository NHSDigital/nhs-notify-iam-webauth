// https://nextjs.org/docs/app/building-your-application/testing/jest#optional-extend-jest-with-custom-matchers
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

/*
 * Polyfill for TextDecoder and TextEncoder
 * https://github.com/jsdom/jsdom/issues/2524
 */
Object.assign(globalThis, { TextDecoder, TextEncoder });

/*
 * Polyfill for structuredClone.
 * amplify/nextjs-adapter uses this in createRunWithAmplifyServerContext by importing GlobalSettings.
 * https://github.com/jsdom/jsdom/issues/3363
 */
Object.assign(globalThis, {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  structuredClone: (val: unknown) => JSON.parse(JSON.stringify(val)),
});
