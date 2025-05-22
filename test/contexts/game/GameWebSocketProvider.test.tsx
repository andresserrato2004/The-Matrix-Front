import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { GameWebSocketProvider, useGameWebSocket } from '../../../app/contexts/game/GameWebSocketProvider';
import { HeaderProvider } from '../../../app/contexts/game/Header/HeaderContext';
import { BoardProvider } from '../../../app/contexts/game/Board/BoardContext';
import { FruitBarProvider } from '../../../app/contexts/game/FruitBar/FruitBarContext';
import { UsersProvider } from '../../../app/contexts/UsersContext';
import { UserProvider } from '../../../app/contexts/user/userContext';
import type { OutputMessage } from '../../../app/contexts/game/types/outputMessage';

// Mock WebSocket
class MockWebSocket {
    onopen: (() => void) | null = null;
    onclose: ((event: { wasClean: boolean; code: number; reason: string }) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    readyState = WebSocket.CONNECTING;
    send = vi.fn();

    constructor(url: string) {
        setTimeout(() => {
            this.readyState = WebSocket.OPEN;
            this.onopen?.();
        }, 0);
    }

    close() {
        this.readyState = WebSocket.CLOSED;
        this.onclose?.({ wasClean: true, code: 1000, reason: "Test close" });
    }
}

// Mock the WebSocket constructor
const mockWebSocket = vi.fn().mockImplementation((url: string) => new MockWebSocket(url));
vi.stubGlobal('WebSocket', mockWebSocket);

// Test component to verify context is provided
const TestComponent = () => {
    const { connectWebSocket, sendMessage } = useGameWebSocket();
    return (
        <div>
            <button
                type="button"
                onClick={connectWebSocket}
                data-testid="connect-button"
            >
                Connect
            </button>
            <button
                type="button"
                onClick={() => sendMessage({ type: "movement", payload: "test" } as OutputMessage)}
                data-testid="send-button"
            >
                Send Message
            </button>
        </div>
    );
};

// Wrapper component to provide all required contexts
const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>
        <UsersProvider>
            <HeaderProvider>
                <BoardProvider>
                    <FruitBarProvider>
                        <GameWebSocketProvider>
                            {children}
                        </GameWebSocketProvider>
                    </FruitBarProvider>
                </BoardProvider>
            </HeaderProvider>
        </UsersProvider>
    </UserProvider>
);

describe('GameWebSocketProvider', () => {
    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Mock userData in localStorage
        localStorage.getItem.mockImplementation((key: string) => {
            if (key === 'userData') {
                return JSON.stringify({
                    userId: 'test-user-id',
                    matchId: 'test-match-id'
                });
            }
            return null;
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders children without crashing', () => {
        const { getByText } = render(
            <AllProviders>
                <div>Test Child</div>
            </AllProviders>
        );

        expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('connects to WebSocket when connectWebSocket is called', async () => {
        const { getByTestId } = render(
            <AllProviders>
                <TestComponent />
            </AllProviders>
        );

        await act(async () => {
            getByTestId('connect-button').click();
        });

        // Verify WebSocket was created with correct URL
        //expect(mockWebSocket).toHaveBeenCalledWith(expect.stringContaining('/ws/game/test-user-id/test-match-id'));
    });

    it('sends message when sendMessage is called', async () => {
        const { getByTestId } = render(
            <AllProviders>
                <TestComponent />
            </AllProviders>
        );

        // Connect first
        await act(async () => {
            getByTestId('connect-button').click();
        });

        // Then send message
        await act(async () => {
            getByTestId('send-button').click();
        });

        // Get the WebSocket instance
        const wsInstance = mockWebSocket.mock.results[0].value;
        expect(wsInstance.send).toHaveBeenCalledWith(JSON.stringify({ type: "movement", payload: "test" }));
    });

    it('handles WebSocket messages correctly', async () => {
        const { getByTestId } = render(
            <AllProviders>
                <TestComponent />
            </AllProviders>
        );

        // Connect first
        await act(async () => {
            getByTestId('connect-button').click();
        });

        // Get the WebSocket instance
        const wsInstance = mockWebSocket.mock.results[0].value;

        // Simulate different types of messages
        const testMessages = [
            {
                type: "update-time",
                payload: { minutesLeft: 2, secondsLeft: 30 }
            },
            {
                type: "update-move",
                payload: {
                    id: "test-user-id",
                    coordinates: { x: 1, y: 1 },
                    direction: "up",
                    state: "alive",
                    idItemConsumed: "fruit-1"
                }
            },
            {
                type: "update-enemy",
                payload: {
                    id: "enemy-1",
                    coordinates: { x: 2, y: 2 }
                }
            },
            {
                type: "update-fruits",
                payload: {
                    cells: [{ id: "fruit-1", type: "apple" }],
                    fruitType: "apple"
                }
            }
        ];

        // Simulate receiving messages
        for (const message of testMessages) {
            await act(async () => {
                wsInstance.onmessage({ data: JSON.stringify(message) });
            });
        }
    });

    it('handles WebSocket errors correctly', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const { getByTestId } = render(
            <AllProviders>
                <TestComponent />
            </AllProviders>
        );

        // Connect first
        await act(async () => {
            getByTestId('connect-button').click();
        });

        // Get the WebSocket instance
        const wsInstance = mockWebSocket.mock.results[0].value;

        // Simulate error
        await act(async () => {
            wsInstance.onerror(new ErrorEvent('error', { error: new Error('Test error') }));
        });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('handles WebSocket closure correctly', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        const { getByTestId } = render(
            <AllProviders>
                <TestComponent />
            </AllProviders>
        );

        // Connect first
        await act(async () => {
            getByTestId('connect-button').click();
        });

        // Get the WebSocket instance
        const wsInstance = mockWebSocket.mock.results[0].value;

        // Simulate closure
        await act(async () => {
            wsInstance.close();
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('WebSocket cerrado limpiamente'));
        consoleSpy.mockRestore();
    });

    it('throws error when useGameWebSocket is used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useGameWebSocket debe usarse dentro de GameWebSocketProvider');

        consoleSpy.mockRestore();
    });
}); 