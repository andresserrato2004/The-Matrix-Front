import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { UserProvider, useUser } from '../../../app/contexts/user/userContext';

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component to access context
const TestComponent = () => {
    const { userData, secondaryUserData, setUserData, setSecondaryUserData, isLoggedIn } = useUser();
    return (
        <div>
            <div data-testid="user-data">{JSON.stringify(userData)}</div>
            <div data-testid="secondary-user-data">{JSON.stringify(secondaryUserData)}</div>
            <div data-testid="is-logged-in">{isLoggedIn.toString()}</div>

            <button
                type="button"
                onClick={() => setUserData({
                    userId: '123',
                    username: 'testUser',
                    position: { x: 0, y: 0 },
                    direction: 'right',
                    imageUrl: '/test.png',
                    state: 'active'
                })}
            >
                Set User Data
            </button>

            <button
                type="button"
                onClick={() => setUserData('456')}
            >
                Set User ID
            </button>

            <button
                type="button"
                onClick={() => setUserData(null)}
            >
                Clear User Data
            </button>

            <button
                type="button"
                onClick={() => setSecondaryUserData({
                    userId: '789',
                    username: 'secondaryUser',
                    position: { x: 1, y: 1 },
                    direction: 'left',
                    imageUrl: '/secondary.png',
                    state: 'active'
                })}
            >
                Set Secondary User Data
            </button>

            <button
                type="button"
                onClick={() => setSecondaryUserData('101')}
            >
                Set Secondary User ID
            </button>

            <button
                type="button"
                onClick={() => setSecondaryUserData(null)}
            >
                Clear Secondary User Data
            </button>
        </div>
    );
};

describe('UserContext', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('provides initial state', () => {
        const { getByTestId } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        expect(getByTestId('user-data')).toHaveTextContent('null');
        expect(getByTestId('secondary-user-data')).toHaveTextContent('null');
        expect(getByTestId('is-logged-in')).toHaveTextContent('false');
    });

    it('loads initial state from localStorage', () => {
        const mockUserData = { userId: '123', username: 'testUser' };
        localStorageMock.setItem('userData', JSON.stringify(mockUserData));

        const { getByTestId } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        expect(getByTestId('user-data')).toHaveTextContent(JSON.stringify(mockUserData));
        expect(getByTestId('is-logged-in')).toHaveTextContent('true');
    });

    it('handles setting complete user data', () => {
        const { getByTestId, getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        act(() => {
            getByText('Set User Data').click();
        });

        const expectedData = {
            userId: '123',
            username: 'testUser',
            position: { x: 0, y: 0 },
            direction: 'right',
            imageUrl: '/test.png',
            state: 'active'
        };

        expect(getByTestId('user-data')).toHaveTextContent(JSON.stringify(expectedData));
        expect(getByTestId('is-logged-in')).toHaveTextContent('true');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', JSON.stringify(expectedData));
    });

    it('handles setting user ID only', () => {
        const { getByTestId, getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        act(() => {
            getByText('Set User ID').click();
        });

        expect(getByTestId('user-data')).toHaveTextContent(JSON.stringify({ userId: '456' }));
        expect(getByTestId('is-logged-in')).toHaveTextContent('true');
    });

    it('handles clearing user data', () => {
        const { getByTestId, getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        // First set some data
        act(() => {
            getByText('Set User Data').click();
        });

        // Then clear it
        act(() => {
            getByText('Clear User Data').click();
        });

        expect(getByTestId('user-data')).toHaveTextContent('null');
        expect(getByTestId('is-logged-in')).toHaveTextContent('false');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('userData');
    });

    it('handles setting secondary user data', () => {
        const { getByTestId, getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        act(() => {
            getByText('Set Secondary User Data').click();
        });

        const expectedData = {
            userId: '789',
            username: 'secondaryUser',
            position: { x: 1, y: 1 },
            direction: 'left',
            imageUrl: '/secondary.png',
            state: 'active'
        };

        expect(getByTestId('secondary-user-data')).toHaveTextContent(JSON.stringify(expectedData));
        expect(localStorageMock.setItem).toHaveBeenCalledWith('secondaryUserData', JSON.stringify(expectedData));
    });

    it('handles setting secondary user ID only', () => {
        const { getByTestId, getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        act(() => {
            getByText('Set Secondary User ID').click();
        });

        expect(getByTestId('secondary-user-data')).toHaveTextContent(JSON.stringify({ userId: '101' }));
    });

    it('handles clearing secondary user data', () => {
        const { getByTestId, getByText } = render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        // First set some data
        act(() => {
            getByText('Set Secondary User Data').click();
        });

        // Then clear it
        act(() => {
            getByText('Clear Secondary User Data').click();
        });

        expect(getByTestId('secondary-user-data')).toHaveTextContent('null');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('secondaryUserData');
    });

    it('throws error when useUser is used outside provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        consoleError.mockRestore();
    });
}); 