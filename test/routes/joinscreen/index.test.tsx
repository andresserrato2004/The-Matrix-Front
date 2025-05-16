import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JoinScreen from '../../../app/routes/joinscreen';
import { useNavigate } from '@remix-run/react';
import { useUser } from '../../../app/contexts/user/userContext';
import api from '../../../app/services/api';

// Mock de las dependencias
vi.mock('@remix-run/react', () => ({
    useNavigate: vi.fn()
}));

vi.mock('../../../app/contexts/user/userContext', () => ({
    useUser: vi.fn()
}));

vi.mock('../../../app/services/api', () => ({
    default: {
        post: vi.fn()
    }
}));

describe('JoinScreen', () => {
    const mockNavigate = vi.fn();
    const mockUserId = '123';

    beforeEach(() => {
        vi.clearAllMocks();

        // Configurar mocks
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useUser as any).mockReturnValue({
            userData: { userId: mockUserId }
        });
    });

    it('renders join screen with all buttons', () => {
        render(<JoinScreen />);

        expect(screen.getByRole('button', { name: /join lobby/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create lobby/i })).toBeInTheDocument();
    });

    it('opens join modal when join button is clicked', () => {
        render(<JoinScreen />);

        const joinButton = screen.getByRole('button', { name: /join lobby/i });
        fireEvent.click(joinButton);

        expect(screen.getByRole('heading', { name: /join lobby/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter 6-Digit Lobby Code')).toBeInTheDocument();
    });

    it('handles room code input correctly', () => {
        render(<JoinScreen />);

        // Abrir el modal
        const joinButton = screen.getByRole('button', { name: /join lobby/i });
        fireEvent.click(joinButton);

        // Obtener el input
        const input = screen.getByPlaceholderText('Enter 6-Digit Lobby Code');

        // Probar entrada de texto
        fireEvent.change(input, { target: { value: 'abc123' } });
        expect(input).toHaveValue('ABC123');

        // Probar límite de caracteres
        fireEvent.change(input, { target: { value: 'abcdefghijklmnop' } });
        expect(input).toHaveValue('ABCDEF');
    });

    it('shows error for empty room code', async () => {
        render(<JoinScreen />);

        // Abrir el modal
        const joinButton = screen.getByRole('button', { name: /join lobby/i });
        fireEvent.click(joinButton);

        // Intentar unirse sin código
        const joinModalButton = screen.getByRole('button', { name: /^join$/i });
        fireEvent.click(joinModalButton);

        // Verificar que el botón Join está deshabilitado
        expect(joinModalButton).toBeDisabled();
    });

    it('handles join lobby successfully', async () => {
        render(<JoinScreen />);

        // Abrir el modal
        const joinButton = screen.getByRole('button', { name: /join lobby/i });
        fireEvent.click(joinButton);

        // Ingresar código válido
        const input = screen.getByPlaceholderText('Enter 6-Digit Lobby Code');
        fireEvent.change(input, { target: { value: 'ABC123' } });

        // Unirse al lobby
        const joinModalButton = screen.getByRole('button', { name: /^join$/i });
        fireEvent.click(joinModalButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/createlobby?code=ABC123');
        });
    });

    it('handles create lobby successfully', async () => {
        const mockResponse = { data: { code: 'XYZ789' } };
        (api.post as any).mockResolvedValueOnce(mockResponse);

        render(<JoinScreen />);

        const createButton = screen.getByRole('button', { name: /create lobby/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                `/rest/users/${mockUserId}/matches`,
                { level: 1, map: 'desert' }
            );
            expect(mockNavigate).toHaveBeenCalledWith('/createlobby?code=XYZ789');
        });
    });

    it('handles create lobby error', async () => {
        const errorMessage = 'Server error';
        (api.post as any).mockRejectedValueOnce({
            response: {
                data: { message: errorMessage }
            }
        });

        render(<JoinScreen />);

        const createButton = screen.getByRole('button', { name: /create lobby/i });
        fireEvent.click(createButton);

        // Verificar que no se navega en caso de error
        await waitFor(() => {
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
}); 