import { render } from '@testing-library/react';
import {
  useSearchParams,
  ReadonlyURLSearchParams,
  redirect,
} from 'next/navigation';
import { Redirect } from '../../components/molecules/Redirect/Redirect';

jest.mock('next/navigation', () => ({
  // Note: We have to requireActual because we need the concrete implementation of ReadonlyURLSearchParams
  ...jest.requireActual('next/navigation'),
  useSearchParams: jest.fn(),
  redirect: jest.fn(),
}));

const redirectMock = jest.mocked(redirect);
const useSearchParamsMock = jest.mocked(useSearchParams);

test.each(['/redirect-path', 'redirect-path'])(
  'Redirect - URL provided %p',
  (redirectPath) => {
    const mockSearchParams = new ReadonlyURLSearchParams({
      redirect: redirectPath,
    });

    useSearchParamsMock.mockReturnValue(mockSearchParams);

    render(<Redirect />);

    expect(redirectMock).toHaveBeenCalledWith(
      `/redirect/redirect-path`,
      'push'
    );
  }
);

test('Redirect - URL not provided', () => {
  const mockSearchParams = new ReadonlyURLSearchParams({});

  jest.mocked(useSearchParams).mockReturnValue(mockSearchParams);

  render(<Redirect />);

  expect(redirectMock).toHaveBeenCalledWith('/home', 'push');
});
