import { render, screen, waitFor } from '@testing-library/react';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import InactivePage from '../../../app/inactive/page';

jest.mock('../../../components/molecules/SignOut/SignOut', () => ({
  SignOut: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('next/navigation', () => ({
  // Note: We have to requireActual because we need the concrete implementation of ReadonlyURLSearchParams
  ...jest.requireActual('next/navigation'),
  useSearchParams: jest.fn(),
}));

const useSearchParamsMock = jest.mocked(useSearchParams);

describe('Inactive page', () => {
  beforeEach(() => jest.resetAllMocks);

  test('matches snapshot', async () => {
    const mockSearchParams = new ReadonlyURLSearchParams({
      redirect: '/my-redirect-path',
    });

    useSearchParamsMock.mockReturnValue(mockSearchParams);

    const container = render(<InactivePage />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  test('should have no redirect path', async () => {
    useSearchParamsMock.mockReturnValue(new ReadonlyURLSearchParams());

    const { findByRole } = render(<InactivePage />);

    const signInLink = await findByRole('button', { name: 'Sign in' });

    expect(signInLink.getAttribute('href')).toEqual('/auth');
  });
});
