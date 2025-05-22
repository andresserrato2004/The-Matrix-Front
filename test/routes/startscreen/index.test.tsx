import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StartScreen, { MicrosoftLoginButton } from '../../../app/routes/startscreen';
import { useNavigate } from '@remix-run/react';
import { useUser } from '../../../app/contexts/user/userContext';
import { useUsers } from '../../../app/contexts/UsersContext';
import { useMsal } from '@azure/msal-react';
import api from '../../../app/services/api';
import * as remix from "@remix-run/react";

// Mock de las dependencias
vi.mock("@remix-run/react", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
        useNavigate: vi.fn(() => vi.fn()),
    };
});

vi.mock('../../../app/contexts/user/userContext', () => ({
    useUser: vi.fn()
}));

vi.mock('../../../app/contexts/UsersContext', () => ({
    useUsers: vi.fn()
}));

vi.mock('@azure/msal-react', () => ({
    useMsal: vi.fn()
}));

vi.mock('../../../app/services/api', () => ({
    default: {
        post: vi.fn()
    }
}));

describe('StartScreen', () => {
    const mockNavigate = vi.fn();
    const mockSetUserData = vi.fn();
    const mockUsersDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Configurar mocks
        (useNavigate as unknown as vi.Mock).mockReturnValue(mockNavigate);
        (useUser as unknown as vi.Mock).mockReturnValue({
            setUserData: mockSetUserData,
            userData: null
        });
        (useUsers as unknown as vi.Mock).mockReturnValue({
            state: { mainUser: {} },
            dispatch: mockUsersDispatch
        });
        (useMsal as unknown as vi.Mock).mockReturnValue({
            instance: {
                loginPopup: vi.fn()
            },
            accounts: []
        });
    });

    it('renders start screen with all buttons', () => {
        render(<StartScreen />);

        expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
    });

    it('shows help modal when help button is clicked', () => {
        render(<StartScreen />);

        const helpButton = screen.getByRole('button', { name: /help/i });
        fireEvent.click(helpButton);
        expect(screen.getByText('Instructions')).toBeInTheDocument();
    });

    it('handles start game successfully', async () => {
        const mockUserId = '123';
        (api.post as unknown as vi.Mock).mockResolvedValueOnce({ data: { userId: mockUserId } });

        render(<StartScreen />);

        const startButton = screen.getByRole('button', { name: /start game/i });
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/rest/users', {}, { withCredentials: false });
            expect(mockSetUserData).toHaveBeenCalledWith(mockUserId);
            expect(mockUsersDispatch).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/joinscreen');
        });
    });

    it('handles start game error', async () => {
        const errorMessage = 'Server error';
        (api.post as unknown as vi.Mock).mockRejectedValueOnce({
            response: {
                data: { message: errorMessage }
            }
        });

        render(<StartScreen />);

        const startButton = screen.getByRole('button', { name: /start game/i });
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(`Server error: ${errorMessage}`)).toBeInTheDocument();
        });
    });
}); 