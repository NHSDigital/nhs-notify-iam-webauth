/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, render } from '@testing-library/react';
import { getCurrentUser } from '@aws-amplify/auth';
import CIS2CallbackPage from '@/src/app/oauth2/page';

const mockRouter = {
  replace: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@aws-amplify/auth');

const mockGetCurrentUser = jest.mocked(getCurrentUser);

function encodeState(input: unknown) {
  const str = JSON.stringify(input);
  return Buffer.from(str).toString('hex');
}

describe('CIS2CallbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should redirect to signin page with custom redirect when user is authenticated, renders loading spinner', async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      userId: 'id',
      username: 'name',
    });

    const customState = `code-${encodeState({ redirectPath: '/templates/my-template' })}`;

    mockSearchParams.get.mockReturnValueOnce(customState);

    const container = render(<CIS2CallbackPage />);

    expect(container.asFragment()).toMatchSnapshot();

    await act(async () => {
      jest.advanceTimersByTime(25);
    });

    expect(getCurrentUser).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/signin?redirect=%2Ftemplates%2Fmy-template'
    );
  });

  it('polls until user is present in cookies, then redirects', async () => {
    for (let i = 0; i < 3; i += 1) {
      mockGetCurrentUser.mockRejectedValueOnce(new Error('Unauthenticated'));
    }

    mockGetCurrentUser.mockResolvedValueOnce({
      userId: 'id',
      username: 'name',
    });

    const customState = `code-${encodeState({ redirectPath: '/templates/my-template' })}`;

    mockSearchParams.get.mockReturnValueOnce(customState);

    render(<CIS2CallbackPage />);

    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        jest.advanceTimersByTime(25);
      });
    }

    expect(getCurrentUser).toHaveBeenCalledTimes(4);
    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/signin?redirect=%2Ftemplates%2Fmy-template'
    );
  });

  it('redirects if polling times out', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('Unauthenticated'));

    const customState = `code-${encodeState({ redirectPath: '/templates/my-template' })}`;

    mockSearchParams.get.mockReturnValueOnce(customState);

    render(<CIS2CallbackPage />);

    await act(async () => {
      jest.advanceTimersByTime(12_000);
    });

    expect(getCurrentUser).toHaveBeenCalledTimes(480);
    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/signin?redirect=%2Ftemplates%2Fmy-template'
    );

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // polling has been stopped
    expect(getCurrentUser).toHaveBeenCalledTimes(480);
  });

  it('uses default redirect destination if custom state cannot be parsed from URL', async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      userId: 'id',
      username: 'name',
    });

    mockSearchParams.get.mockReturnValueOnce(null);

    render(<CIS2CallbackPage />);

    await act(async () => {
      jest.advanceTimersByTime(25);
    });

    expect(getCurrentUser).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/signin?redirect=%2Ftemplates%2Fmessage-templates'
    );
  });
});
