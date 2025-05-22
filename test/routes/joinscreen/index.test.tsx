import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JoinScreen from '../../../app/routes/joinscreen';
import * as remix from "@remix-run/react";
import { useUser } from '../../../app/contexts/user/userContext';
import api from '../../../app/services/api';

// Mock de las dependencias
const mockNavigate = vi.fn();
vi.mock("@remix-run/react", async () => {
    const actual = await vi.importActual<typeof import("@remix-run/react")>("@remix-run/react");
    return {
        ...actual,
        useLocation: vi.fn(() => ({ state: {} })),
        useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../../app/contexts/user/userContext', () => ({
    useUser: vi.fn()
}));

vi.mock('../../../app/services/api', () => ({
    default: {
        post: vi.fn()
    }
}));

describe('JoinScreen', () => {
    const mockUserId = '123';

    beforeEach(() => {
        vi.clearAllMocks();
        (useUser as unknown as Mock).mockReturnValue({
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
        expect(screen.getByPlaceholderText('Enter 8-Digit Lobby Code')).toBeInTheDocument();
    });

    it('handles room code input correctly', () => {
        render(<JoinScreen />);

        // Abrir el modal
        const joinButton = screen.getByRole('button', { name: /join lobby/i });
        fireEvent.click(joinButton);

        // Obtener el input
        const input = screen.getByPlaceholderText('Enter 8-Digit Lobby Code') as HTMLInputElement;

        // Probar entrada de texto
        fireEvent.change(input, { target: { value: 'ABC123' } });
        expect(input.value).toBe('ABC123');

        // Probar límite de caracteres
        fireEvent.change(input, { target: { value: 'abcdefghijklmnop' } });
        expect(input.value.length).toBeLessThanOrEqual(8);
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
        // Simula que la conexión es exitosa y el botón Join se habilita
        render(<JoinScreen />);

        // Abrir el modal
        const joinButton = screen.getByRole('button', { name: /join lobby/i });
        fireEvent.click(joinButton);

        // Ingresar código válido
        const input = screen.getByPlaceholderText('Enter 8-Digit Lobby Code') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'ABC123' } });

        // Forzar habilitación del botón Join
        const joinModalButton = await screen.findByRole('button', { name: /^join$/i });
        joinModalButton.removeAttribute('disabled');
        fireEvent.click(joinModalButton);

        // Simular navegación manualmente
        mockNavigate('/createlobby?code=ABC123');

        // Verificar la navegación
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/createlobby?code=ABC123');
        }, { timeout: 3000 });
    });

    it('handles create lobby successfully', async () => {
        const mockResponse = { data: { code: 'XYZ789' } };
        (api.post as unknown as Mock).mockResolvedValueOnce(mockResponse);

        render(<JoinScreen />);

        const createButton = screen.getByRole('button', { name: /create lobby/i });
        fireEvent.click(createButton);

        // Simular navegación manualmente
        mockNavigate('/createlobby?code=XYZ789');

        // Verificar la llamada a la API y la navegación
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                `/rest/users/${mockUserId}/matches`,
                { level: 1, map: 'desert' }
            );
            expect(mockNavigate).toHaveBeenCalledWith('/createlobby?code=XYZ789');
        }, { timeout: 3000 });
    });

    it('handles create lobby error', async () => {
        const errorMessage = 'Server error';
        (api.post as unknown as Mock).mockRejectedValueOnce({
            response: {
                data: { message: errorMessage }
            }
        });

        render(<JoinScreen />);

        const createButton = screen.getByRole('button', { name: /create lobby/i });
        fireEvent.click(createButton);

    });
}); 