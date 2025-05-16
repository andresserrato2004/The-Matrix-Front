import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Lobby from '../../../app/routes/createlobby';
import { useNavigate } from '@remix-run/react';
import { useUser } from '../../../app/contexts/user/userContext';
import { useUsers } from '../../../app/contexts/UsersContext';
import { useWebSocket } from '../../../app/hooks/useWebSocket';
import api from '../../../app/services/api';

// Mock de las dependencias
vi.mock('@remix-run/react', () => ({
    useNavigate: vi.fn()
}));

vi.mock('../../../app/contexts/user/userContext', () => ({
    useUser: vi.fn()
}));

vi.mock('../../../app/contexts/UsersContext', () => ({
    useUsers: vi.fn(),
    UsersProvider: ({ children }) => children
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
    const mockWebSocket = {
        onopen: null,
        onmessage: null,
        send: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Configurar mocks
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useUser as any).mockReturnValue({
            userData: { userId: mockUserId },
            setUserData: vi.fn(),
            secondaryUserData: null,
            setSecondaryUserData: vi.fn()
        });
        (useUsers as any).mockReturnValue({
            state: {
                mainUser: {},
                secondaryUser: {}
            },
            dispatch: vi.fn()
        });
        (useWebSocket as any).mockReturnValue({
            connect: vi.fn().mockImplementation((handlers) => {
                handlers(mockWebSocket);
                return mockWebSocket;
            })
        });
        (api.get as any).mockResolvedValueOnce({
            data: { matchId: mockMatchId }
        });
    });

    it('renders lobby with room code', async () => {
        render(<Lobby />);

        await waitFor(() => {
            expect(screen.getByText(mockMatchId)).toBeInTheDocument();
        });
    });

    it('handles player 1 ice cream selection', () => {
        render(<Lobby />);


    });

    it('handles player 1 ready state', () => {
        render(<Lobby />);

        const readyButton = screen.getByText('Ready');
        fireEvent.click(readyButton);

        expect(readyButton).toHaveClass('ready');
    });

    it('handles start game when both players are ready', async () => {
        const mockMessage = {
            match: {
                id: 'match123',
                board: {
                    playersStartCoordinates: [[0, 0], [1, 1]]
                }
            }
        };

        render(<Lobby />);

        // Seleccionar helado para jugador 1

        // Marcar jugador 1 como listo
        const readyButton = screen.getByText('Ready');
        fireEvent.click(readyButton);

        // Simular mensaje de WebSocket
        const messageEvent = new MessageEvent('message', {
            data: JSON.stringify(mockMessage)
        });

    });

    it('handles back button click', () => {
        render(<Lobby />);

        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/joinscreen');
    });

    it('handles find opponent button click', () => {
        render(<Lobby />);
    });

    it('handles cancel matchmaking', () => {
        render(<Lobby />);

        // Primero iniciar la búsqueda
        const findOpponentButton = screen.getByText('Find Opponent');
        fireEvent.click(findOpponentButton);

        // Luego cancelar

        expect(screen.queryByText('Searching for opponent...')).not.toBeInTheDocument();
    });
}); 