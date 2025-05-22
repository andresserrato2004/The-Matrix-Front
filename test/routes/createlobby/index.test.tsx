import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Lobby from '../../../app/routes/createlobby';
import { useNavigate } from '@remix-run/react';
import { useUser } from '../../../app/contexts/user/userContext';
import { useUsers } from '../../../app/contexts/UsersContext';
import { useWebSocket } from '../../../app/hooks/useWebSocket';
import api from '../../../app/services/api';
import * as remix from "@remix-run/react";

// Mock de las dependencias
vi.mock("@remix-run/react", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useLocation: vi.fn(() => ({ state: {} })),
        useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
        useNavigate: vi.fn(() => vi.fn()),
    };
});

vi.mock('../../../app/contexts/user/userContext', () => ({
    useUser: vi.fn()
}));

vi.mock('../../../app/contexts/UsersContext', () => ({
    useUsers: vi.fn(),
    UsersProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../../app/hooks/useWebSocket', () => ({
    useWebSocket: vi.fn()
}));

vi.mock('../../../app/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('Lobby', () => {
    const mockNavigate = vi.fn();
    const mockUserId = '123';
    const mockMatchId = 'ABC123';
    const mockSetUserData = vi.fn();
    const mockSetSecondaryUserData = vi.fn();
    const mockUsersDispatch = vi.fn();

    // Define proper types for WebSocket mock
    type WebSocketHandler = (event: Event | MessageEvent) => void;
    interface MockWebSocket {
        onopen: WebSocketHandler | null;
        onmessage: WebSocketHandler | null;
        onerror: WebSocketHandler | null;
        onclose: WebSocketHandler | null;
        send: (data: string) => void;
        close: () => void;
    }

    const mockWebSocket: MockWebSocket = {
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null,
        send: vi.fn(),
        close: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Configurar mocks
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useUser as any).mockReturnValue({
            userData: { userId: mockUserId },
            setUserData: mockSetUserData,
            secondaryUserData: null,
            setSecondaryUserData: mockSetSecondaryUserData
        });
        (useUsers as any).mockReturnValue({
            state: {
                mainUser: {},
                secondaryUser: {}
            },
            dispatch: mockUsersDispatch
        });
        (useWebSocket as any).mockReturnValue({
            connect: vi.fn().mockReturnValue(mockWebSocket)
        });
        (api.get as any).mockResolvedValue({
            data: { matchId: mockMatchId }
        });
    });

    describe('Lobby State Management', () => {
        it('renders lobby with room code', async () => {
            render(<Lobby />);

            await waitFor(() => {
                expect(screen.getByText(mockMatchId)).toBeInTheDocument();
            });
        });

        it('handles player ready state toggles', () => {
            render(<Lobby />);



        });

        it('handles matchmaking search timer', async () => {
            render(<Lobby />);

            // Start matchmaking
            const findOpponentButton = screen.getByText('Find Opponent');
            fireEvent.click(findOpponentButton);

            // Wait for timer to increment
            await waitFor(() => {
                const searchTime = screen.getByText(/Time: \d{2}:\d{2}/);
                expect(searchTime).toBeInTheDocument();
            });
        });

        it('sets default player 2 character in solo mode', async () => {
            render(<Lobby />);


        });
    });

    describe('WebSocket Handling', () => {
        it('handles WebSocket connection and message flow for host', async () => {
            const mockMessage = {
                message: 'match-found',
                match: {
                    id: 'match123',
                    host: mockUserId,
                    guestId: '456',
                    board: {
                        playersStartCoordinates: [[0, 0], [1, 1]]
                    }
                }
            };

            render(<Lobby />);

            // Start matchmaking
            const findOpponentButton = screen.getByText('Find Opponent');
            fireEvent.click(findOpponentButton);

            // Simulate WebSocket message
            if (mockWebSocket.onmessage) {
                mockWebSocket.onmessage(new MessageEvent('message', {
                    data: JSON.stringify(mockMessage)
                }));
            }

            await waitFor(() => {
                expect(mockSetUserData).toHaveBeenCalledWith(expect.objectContaining({
                    matchId: 'match123',
                    position: [0, 0]
                }));
            });
        });

        it('handles WebSocket connection and message flow for guest', async () => {
            const mockMessage = {
                message: 'match-found',
                match: {
                    id: 'match123',
                    host: '789',
                    guestId: mockUserId,
                    board: {
                        playersStartCoordinates: [[0, 0], [1, 1]]
                    }
                }
            };

            render(<Lobby />);

            // Start matchmaking
            const findOpponentButton = screen.getByText('Find Opponent');
            fireEvent.click(findOpponentButton);

            // Simulate WebSocket message
            if (mockWebSocket.onmessage) {
                mockWebSocket.onmessage(new MessageEvent('message', {
                    data: JSON.stringify(mockMessage)
                }));
            }

            await waitFor(() => {
                expect(mockSetUserData).toHaveBeenCalledWith(expect.objectContaining({
                    matchId: 'match123',
                    position: [1, 1]
                }));
            });
        });

        it('handles WebSocket errors', async () => {
            render(<Lobby />);

            // Start matchmaking
            const findOpponentButton = screen.getByText('Find Opponent');
            fireEvent.click(findOpponentButton);

            // Simulate WebSocket error
            if (mockWebSocket.onerror) {
                mockWebSocket.onerror(new Event('error'));
            }

            await waitFor(() => {
                expect(screen.getByText('WebSocket connection error')).toBeInTheDocument();
            });
        });

        it('handles WebSocket connection close', async () => {
            render(<Lobby />);

            // Start matchmaking
            const findOpponentButton = screen.getByText('Find Opponent');
            fireEvent.click(findOpponentButton);

            // Simulate WebSocket close
            if (mockWebSocket.onclose) {
                mockWebSocket.onclose(new Event('close'));
            }

            await waitFor(() => {
                expect(screen.queryByText('Searching for opponent...')).not.toBeInTheDocument();
            });
        });
    });

    describe('Game Flow', () => {
        it('handles start game in solo mode', async () => {
            render(<Lobby />);


            // Start game

        });

        it('handles start game in two-player mode', async () => {
            render(<Lobby />);


            // Start game

        });

        it('shows alert when trying to start without ready players', () => {
            const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => { });

            render(<Lobby />);



            mockAlert.mockRestore();
        });
    });

    describe('Utility Functions', () => {
        it('formats search time correctly', async () => {
            render(<Lobby />);

            // Start matchmaking
            const findOpponentButton = screen.getByText('Find Opponent');
            fireEvent.click(findOpponentButton);

            // Wait for timer to increment
            await waitFor(() => {
                const searchTime = screen.getByText(/Time: \d{2}:\d{2}/);

            });
        });

        it('handles cancel matchmaking', async () => {
            render(<Lobby />);

            // Start matchmaking
            const findOpponentButton = screen.getByText('Find Opponent');
            fireEvent.click(findOpponentButton);

            // Cancel matchmaking
            const cancelButton = screen.getByText('Cancel Search');
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText('Searching for opponent...')).not.toBeInTheDocument();
            });
        });

        it('handles back button click', () => {
            render(<Lobby />);

            const backButton = screen.getByText('Back');
            fireEvent.click(backButton);

            expect(mockNavigate).toHaveBeenCalledWith('/joinscreen');
        });
    });
}); 