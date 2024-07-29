// https://nextjs.org/docs/app/building-your-application/testing/jest#optional-extend-jest-with-custom-matchers
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });
