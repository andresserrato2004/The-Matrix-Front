import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { UsersProvider, useUsers } from '../../app/contexts/UsersContext';
import type { UserInformation, GameState } from '../../app/contexts/game/types/types';

// Test component to verify context is provided
const TestComponent = () => {
    const { state, dispatch } = useUsers();
    return (
        <div>
            <div data-testid="main-user">{JSON.stringify(state.mainUser)}</div>
            <div data-testid="secondary-user">{JSON.stringify(state.secondaryUser)}</div>
            <div data-testid="game-state">{state.gameState}</div>
            <button
                type="button"
                onClick={() => dispatch({ type: "SET_MAIN_USER", payload: { ...state.mainUser, name: "New Name" } })}
                data-testid="update-main-user"
            >
                Update Main User
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: "SET_SECONDARY_USER", payload: { ...state.secondaryUser, name: "New Name" } })}
                data-testid="update-secondary-user"
            >
                Update Secondary User
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: "SET_MATCHID", payload: { matchId: "123" } })}
                data-testid="update-match-id"
            >
                Update Match ID
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: "MOVE_USER", payload: { playerId: state.mainUser.id, coordinates: { x: 1, y: 1 }, direction: "up", state: "alive" } })}
                data-testid="move-main-user"
            >
                Move Main User
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: "SET_GAME_STATE", payload: "paused" })}
                data-testid="update-game-state"
            >
                Update Game State
            </button>
        </div>
    );
};

describe('UsersContext', () => {
    it('renders children without crashing', () => {
        const { getByText } = render(
            <UsersProvider>
                <div>Test Child</div>
            </UsersProvider>
        );

        expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('provides initial state correctly', () => {
        const { getByTestId } = render(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        const mainUser = JSON.parse(getByTestId('main-user').textContent || '{}');
        const secondaryUser = JSON.parse(getByTestId('secondary-user').textContent || '{}');
        const gameState = getByTestId('game-state').textContent;

        expect(mainUser).toEqual({
            id: "",
            matchId: "",
            name: "player1",
            flavour: "vanilla",
            position: { x: 0, y: 0 },
            direction: "down",
            state: "alive"
        });
        expect(secondaryUser).toEqual({
            id: "",
            matchId: "",
            name: "player2",
            flavour: "vanilla",
            position: { x: 0, y: 0 },
            direction: "down",
            state: "alive"
        });
        expect(gameState).toBe("playing");
    });

    it('updates main user correctly', () => {
        const { getByTestId } = render(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        act(() => {
            getByTestId('update-main-user').click();
        });

        const mainUser = JSON.parse(getByTestId('main-user').textContent || '{}');
        expect(mainUser.name).toBe("New Name");
    });

    it('updates secondary user correctly', () => {
        const { getByTestId } = render(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        act(() => {
            getByTestId('update-secondary-user').click();
        });

        const secondaryUser = JSON.parse(getByTestId('secondary-user').textContent || '{}');
        expect(secondaryUser.name).toBe("New Name");
    });

    it('updates match ID for both users', () => {
        const { getByTestId } = render(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        act(() => {
            getByTestId('update-match-id').click();
        });

        const mainUser = JSON.parse(getByTestId('main-user').textContent || '{}');
        const secondaryUser = JSON.parse(getByTestId('secondary-user').textContent || '{}');

        expect(mainUser.matchId).toBe("123");
        expect(secondaryUser.matchId).toBe("123");
    });

    it('moves main user correctly', () => {
        const { getByTestId } = render(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        act(() => {
            getByTestId('move-main-user').click();
        });

        const mainUser = JSON.parse(getByTestId('main-user').textContent || '{}');
        expect(mainUser.position).toEqual({ x: 1, y: 1 });
        expect(mainUser.direction).toBe("up");
    });

    it('updates game state correctly', () => {
        const { getByTestId } = render(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        act(() => {
            getByTestId('update-game-state').click();
        });

        const gameState = getByTestId('game-state').textContent;
        expect(gameState).toBe("paused");
    });

    it('throws error when useUsers is used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useUsers must be used within a UsersProvider');

        consoleSpy.mockRestore();
    });

    it('maintains state between renders', () => {
        const { getByTestId, rerender } = render(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        // Initial state
        const initialMainUser = JSON.parse(getByTestId('main-user').textContent || '{}');

        // Update state
        act(() => {
            getByTestId('update-main-user').click();
        });

        // Re-render
        rerender(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        // State should be maintained
        const updatedMainUser = JSON.parse(getByTestId('main-user').textContent || '{}');
        expect(updatedMainUser.name).toBe("New Name");
    });

    it('handles multiple state updates correctly', () => {
        const { getByTestId } = render(
            <UsersProvider>
                <TestComponent />
            </UsersProvider>
        );

        act(() => {
            getByTestId('update-main-user').click();
            getByTestId('update-match-id').click();
            getByTestId('update-game-state').click();
        });

        const mainUser = JSON.parse(getByTestId('main-user').textContent || '{}');
        const gameState = getByTestId('game-state').textContent;

        expect(mainUser.name).toBe("New Name");
        expect(mainUser.matchId).toBe("123");
        expect(gameState).toBe("paused");
    });
}); 