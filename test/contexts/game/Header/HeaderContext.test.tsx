import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { HeaderProvider, useHeader } from '../../../../app/contexts/game/Header/HeaderContext';

// Test component to access context
const TestComponent = () => {
    const { state, dispatch } = useHeader();
    return (
        <div>
            <div data-testid="score">{state.score}</div>
            <div data-testid="minutes">{state.minutes}</div>
            <div data-testid="seconds">{state.seconds}</div>
            <div data-testid="music-on">{state.musicOn.toString()}</div>
            <div data-testid="sound-effects-on">{state.soundEffectsOn.toString()}</div>
            <div data-testid="is-running">{state.isRunning.toString()}</div>

            <button
                type="button"
                onClick={() => dispatch({ type: 'INCREMENT_SCORE' })}
            >
                Increment Score
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: 'SET_SCORE', payload: 100 })}
            >
                Set Score
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: 'SET_MINUTES', payload: 5 })}
            >
                Set Minutes
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: 'SET_SECONDS', payload: 30 })}
            >
                Set Seconds
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: 'SET_MUSIC', payload: false })}
            >
                Toggle Music
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: 'SET_SOUND_EFFECTS', payload: false })}
            >
                Toggle Sound Effects
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: 'SET_IS_RUNNING', payload: false })}
            >
                Toggle Running
            </button>
        </div>
    );
};

describe('HeaderContext', () => {
    it('provides initial state', () => {
        const { getByTestId } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        expect(getByTestId('score')).toHaveTextContent('0');
        expect(getByTestId('minutes')).toHaveTextContent('0');
        expect(getByTestId('seconds')).toHaveTextContent('0');
        expect(getByTestId('music-on')).toHaveTextContent('true');
        expect(getByTestId('sound-effects-on')).toHaveTextContent('true');
        expect(getByTestId('is-running')).toHaveTextContent('true');
    });

    it('handles INCREMENT_SCORE action', () => {
        const { getByTestId, getByText } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        act(() => {
            getByText('Increment Score').click();
        });

        expect(getByTestId('score')).toHaveTextContent('1');
    });

    it('handles SET_SCORE action', () => {
        const { getByTestId, getByText } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        act(() => {
            getByText('Set Score').click();
        });

        expect(getByTestId('score')).toHaveTextContent('100');
    });

    it('handles SET_MINUTES action', () => {
        const { getByTestId, getByText } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        act(() => {
            getByText('Set Minutes').click();
        });

        expect(getByTestId('minutes')).toHaveTextContent('5');
    });

    it('handles SET_SECONDS action', () => {
        const { getByTestId, getByText } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        act(() => {
            getByText('Set Seconds').click();
        });

        expect(getByTestId('seconds')).toHaveTextContent('30');
    });

    it('handles SET_MUSIC action', () => {
        const { getByTestId, getByText } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        act(() => {
            getByText('Toggle Music').click();
        });

        expect(getByTestId('music-on')).toHaveTextContent('false');
    });

    it('handles SET_SOUND_EFFECTS action', () => {
        const { getByTestId, getByText } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        act(() => {
            getByText('Toggle Sound Effects').click();
        });

        expect(getByTestId('sound-effects-on')).toHaveTextContent('false');
    });

    it('handles SET_IS_RUNNING action', () => {
        const { getByTestId, getByText } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        act(() => {
            getByText('Toggle Running').click();
        });

        expect(getByTestId('is-running')).toHaveTextContent('false');
    });

    it('maintains state between multiple actions', () => {
        const { getByTestId, getByText } = render(
            <HeaderProvider>
                <TestComponent />
            </HeaderProvider>
        );

        // Perform multiple actions
        act(() => {
            getByText('Set Score').click();
            getByText('Set Minutes').click();
            getByText('Set Seconds').click();
            getByText('Toggle Music').click();
        });

        // Verify all states are maintained
        expect(getByTestId('score')).toHaveTextContent('100');
        expect(getByTestId('minutes')).toHaveTextContent('5');
        expect(getByTestId('seconds')).toHaveTextContent('30');
        expect(getByTestId('music-on')).toHaveTextContent('false');
    });

    it('throws error when useHeader is used outside provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useHeader must be used within a HeaderProvider');

        consoleError.mockRestore();
    });
}); 