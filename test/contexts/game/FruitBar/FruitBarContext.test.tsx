import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { FruitBarProvider, useFruitBar } from '../../../../app/contexts/game/FruitBar/FruitBarContext';

// Test component to access context
const TestComponent = () => {
    const { state, dispatch } = useFruitBar();
    return (
        <div>
            <div data-testid="fruits-count">{state.fruits.length}</div>
            <div data-testid="actual-fruit">{state.actualFruit}</div>
            <button
                type="button"
                onClick={() => dispatch({
                    type: 'SET_FRUITS',
                    payload: ['apple', 'banana', 'orange']
                })}
            >
                Set Fruits
            </button>
            <button
                type="button"
                onClick={() => dispatch({
                    type: 'SET_ACTUAL_FRUIT',
                    payload: 'apple'
                })}
            >
                Set Actual Fruit
            </button>
        </div>
    );
};

describe('FruitBarContext', () => {
    it('provides initial state', () => {
        const { getByTestId } = render(
            <FruitBarProvider>
                <TestComponent />
            </FruitBarProvider>
        );

        expect(getByTestId('fruits-count')).toHaveTextContent('0');
        expect(getByTestId('actual-fruit')).toHaveTextContent('');
    });

    it('handles SET_FRUITS action', () => {
        const { getByTestId, getByText } = render(
            <FruitBarProvider>
                <TestComponent />
            </FruitBarProvider>
        );

        act(() => {
            getByText('Set Fruits').click();
        });

        expect(getByTestId('fruits-count')).toHaveTextContent('3');
    });

    it('handles SET_ACTUAL_FRUIT action', () => {
        const { getByTestId, getByText } = render(
            <FruitBarProvider>
                <TestComponent />
            </FruitBarProvider>
        );

        act(() => {
            getByText('Set Actual Fruit').click();
        });

        expect(getByTestId('actual-fruit')).toHaveTextContent('apple');
    });

    it('maintains state between actions', () => {
        const { getByTestId, getByText } = render(
            <FruitBarProvider>
                <TestComponent />
            </FruitBarProvider>
        );

        // First set fruits
        act(() => {
            getByText('Set Fruits').click();
        });

        // Then set actual fruit
        act(() => {
            getByText('Set Actual Fruit').click();
        });

        expect(getByTestId('fruits-count')).toHaveTextContent('3');
        expect(getByTestId('actual-fruit')).toHaveTextContent('apple');
    });

    it('throws error when useFruitBar is used outside provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useFruitBar must be used within a FruitBarProvider');

        consoleError.mockRestore();
    });
}); 