import { mockDeep } from 'jest-mock-extended';
import { render } from '@testing-library/react';
import {
  useSearchParams,
  ReadonlyURLSearchParams,
  redirect,
} from 'next/navigation';
import { Redirect } from '../../components/molecules/Redirect/Redirect';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn(),
  useSearchParams: jest.fn(),
}));

test('Redirect - URL provided', () => {
  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  const mockSearchParams = new ReadonlyURLSearchParams({
    redirect: '/redirect-path',
  });
  jest.mocked(useSearchParams).mockReturnValue(mockSearchParams);

  render(<Redirect />);

  expect(mockRedirect).toHaveBeenCalledWith('/redirect/redirect-path');
});

test('Redirect - URL not provided', () => {
  const mockRedirect = jest.fn(mockDeep<typeof redirect>());
  jest.mocked(redirect).mockImplementation(mockRedirect);

  const mockSearchParams = new ReadonlyURLSearchParams({});
  jest.mocked(useSearchParams).mockReturnValue(mockSearchParams);

  render(<Redirect />);

  expect(mockRedirect).toHaveBeenCalledWith('/redirect/');
});
