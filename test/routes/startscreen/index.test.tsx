import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StartScreen, { MicrosoftLoginButton } from '../../../app/routes/startscreen';
import { useNavigate } from '@remix-run/react';
import { useUser } from '../../../app/contexts/user/userContext';
import { useUsers } from '../../../app/contexts/UsersContext';
import { useMsal } from '@azure/msal-react';
import api from '../../../app/services/api';

// Mock de las dependencias
vi.mock('@remix-run/react', () => ({
    useNavigate: vi.fn()
}));

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
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useUser as any).mockReturnValue({
            setUserData: mockSetUserData,
            userData: null
        });
        (useUsers as any).mockReturnValue({
            state: { mainUser: {} },
            dispatch: mockUsersDispatch
        });
        (useMsal as any).mockReturnValue({
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
        expect(screen.getByRole('button', { name: /iniciar sesión con microsoft/i })).toBeInTheDocument();
    });

    it('shows help modal when help button is clicked', () => {
        render(<StartScreen />);

        const helpButton = screen.getByRole('button', { name: /help/i });
        fireEvent.click(helpButton);
        expect(screen.getByText('Ice Cream Score')).toBeInTheDocument();
    });

    it('handles start game successfully', async () => {
        const mockUserId = '123';
        (api.post as any).mockResolvedValueOnce({ data: { userId: mockUserId } });

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
        (api.post as any).mockRejectedValueOnce({
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

describe('MicrosoftLoginButton', () => {
    const mockLoginPopup = vi.fn();
    const mockAccounts: { username: string }[] = [];

    beforeEach(() => {
        vi.clearAllMocks();
        (useMsal as any).mockReturnValue({
            instance: {
                loginPopup: mockLoginPopup
            },
            accounts: mockAccounts
        });
    });

    it('renders login button', () => {
        render(<MicrosoftLoginButton />);
        expect(screen.getByRole('button', { name: /iniciar sesión con microsoft/i })).toBeInTheDocument();
    });

    it('calls loginPopup when clicked', () => {
        render(<MicrosoftLoginButton />);
        const loginButton = screen.getByRole('button', { name: /iniciar sesión con microsoft/i });
        fireEvent.click(loginButton);
        expect(mockLoginPopup).toHaveBeenCalledWith({
            scopes: ['User.Read']
        });
    });

    it('shows username when logged in', () => {
        const mockUsername = 'test@example.com';
        (useMsal as any).mockReturnValue({
            instance: {
                loginPopup: mockLoginPopup
            },
            accounts: [{ username: mockUsername }]
        });

        render(<MicrosoftLoginButton />);
        const usernameElement = screen.getByText((content, element) => {
            return element?.textContent === `Sesión iniciada como: ${mockUsername}`;
        });
        expect(usernameElement).toBeInTheDocument();
    });
}); 